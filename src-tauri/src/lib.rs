//! # QuDaMemo Tauri Core Module
//!
//! QuDaMemo デスクトップアプリケーションの核心となる Rust バックエンドライブラリです。
//! 高速なファイルスキャン、YAML Frontmatter パース、
//! 一時ファイル経由のアトミック書き込み、およびパストラバーサル防御を提供します。

pub mod commands;

use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::{Component, Path, PathBuf};

/// メモファイルの YAML Frontmatter メタデータ情報
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct FrontmatterDto {
    /// メモのタイトル
    #[serde(default)]
    pub title: Option<String>,
    /// 日付 (YYYY-MM-DD)
    pub date: String,
    /// 曜日 (月, 火, 水...)
    #[serde(default)]
    pub weekday: String,
    /// 祝日名（祝日でない場合は None）
    #[serde(default)]
    pub holiday: Option<String>,
    /// AI要約テキスト
    #[serde(default)]
    pub summary: Option<String>,
    /// 要約生成エンジン種別 (例: "gemini-3.7-flash", "local-fallback")
    #[serde(default)]
    pub summary_type: Option<String>,
    /// タグ一覧
    #[serde(default)]
    pub tags: Vec<String>,
    /// 最終更新日時
    #[serde(default, alias = "updatedAt")]
    pub updated_at: Option<String>,
}

/// メモ1件を表す高機能 DTO 構造体
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct QuickMemoDto {
    /// メモ識別子 (YYYYMMDD)
    pub id: String,
    /// ISO日付 (YYYY-MM-DD)
    pub date: String,
    /// ディスク物理ファイル名 (YYYYMMDD.md)
    pub filename: String,
    /// マークダウン本文テキスト
    pub content: String,
    /// Frontmatterを含む生の全Markdownテキスト
    #[serde(rename = "rawMarkdown")]
    pub raw_markdown: String,
    /// AI生成サマリーテキスト
    #[serde(rename = "aiSummary")]
    pub ai_summary: String,
    /// パース済み Frontmatter オブジェクト
    pub frontmatter: FrontmatterDto,
    /// 最終更新日時
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// `%USERPROFILE%` や先頭 `~` をOSのホームディレクトリパスへ安全に展開する
pub fn expand_env_path(raw_path: &str) -> PathBuf {
    let trimmed = raw_path.trim();
    let home = std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .unwrap_or_default();

    if !home.is_empty() {
        if let Some(rest) = trimmed
            .strip_prefix("%USERPROFILE%")
            .or_else(|| trimmed.strip_prefix("%userprofile%"))
        {
            let rel = rest.trim_start_matches(['\\', '/']);
            return if rel.is_empty() {
                PathBuf::from(home)
            } else {
                PathBuf::from(home).join(rel)
            };
        }
        if trimmed == "~" {
            return PathBuf::from(home);
        }
        if let Some(rest) = trimmed
            .strip_prefix("~/")
            .or_else(|| trimmed.strip_prefix("~\\"))
        {
            return PathBuf::from(home).join(rest);
        }
    }

    PathBuf::from(trimmed)
}

/// 単一ファイル名であることを検証し、パストラバーサル (`..` やディレクトリ区切り) を遮断する
fn validate_single_filename(name: &str) -> Result<&str, String> {
    let trimmed = name.trim();
    if trimmed.is_empty()
        || trimmed.contains('/')
        || trimmed.contains('\\')
        || trimmed.contains('\0')
    {
        return Err(format!("不正なファイル名です: {}", name));
    }
    let path = Path::new(trimmed);
    let mut components = path.components();
    match (components.next(), components.next()) {
        (Some(Component::Normal(_)), None) => Ok(trimmed),
        _ => Err(format!("パストラバーサルが検出されました: {}", name)),
    }
}

/// 同一ディレクトリ内の一時ファイルへ書き込み＋フラッシュした後、アトミックに置換する
fn atomic_write(target_path: &Path, data: &[u8]) -> Result<(), String> {
    if let Some(parent) = target_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }

    let file_name = target_path
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| format!("無効な保存先パスです: {}", target_path.display()))?;
    let pid = std::process::id();
    let tmp_path = target_path.with_file_name(format!(".{}.{}.tmp", file_name, pid));

    let write_res = (|| -> std::io::Result<()> {
        let mut file = File::create(&tmp_path)?;
        file.write_all(data)?;
        file.sync_all()?;
        Ok(())
    })();

    if let Err(e) = write_res {
        let _ = fs::remove_file(&tmp_path);
        return Err(e.to_string());
    }

    if let Err(rename_err) = fs::rename(&tmp_path, target_path) {
        // Windows 環境で既存ファイル上書き rename が失敗するケースへの安全フォールバック
        if target_path.exists() {
            fs::copy(&tmp_path, target_path).map_err(|e| {
                let _ = fs::remove_file(&tmp_path);
                format!("rename失敗({})後のコピーにも失敗: {}", rename_err, e)
            })?;
            let _ = fs::remove_file(&tmp_path);
        } else {
            let _ = fs::remove_file(&tmp_path);
            return Err(rename_err.to_string());
        }
    }

    Ok(())
}

/// 先頭の YAML Frontmatter ブロック (`---` 行 〜 `---` 行) と本文を安全に分離する
fn split_frontmatter(raw: &str) -> Option<(String, String)> {
    let mut lines = raw.split_inclusive('\n');
    let first = lines.next()?;
    if first.trim_end_matches(['\r', '\n']) != "---" {
        return None;
    }

    let mut yaml_buf = String::new();
    let mut consumed = first.len();
    for line in lines {
        consumed += line.len();
        if line.trim_end_matches(['\r', '\n']) == "---" {
            let body = raw[consumed..].trim_start().to_string();
            return Some((yaml_buf, body));
        }
        yaml_buf.push_str(line);
    }

    None
}

/// クォートを剥がす小さなヘルパー
fn unquote(val: &str) -> String {
    let trimmed = val.trim();
    if trimmed.len() >= 2
        && ((trimmed.starts_with('"') && trimmed.ends_with('"'))
            || (trimmed.starts_with('\'') && trimmed.ends_with('\'')))
    {
        trimmed[1..trimmed.len() - 1].to_string()
    } else {
        trimmed.to_string()
    }
}

/// YAML Frontmatter および本文を高速にパースして `QuickMemoDto` へ変換する
pub fn parse_markdown_to_memo(file_path: &Path, raw: &str) -> Option<QuickMemoDto> {
    let filename = file_path.file_name()?.to_str()?.to_string();
    let memo_id = filename.trim_end_matches(".md").to_string();

    if memo_id.len() != 8 || !memo_id.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }

    let yyyy = &memo_id[0..4];
    let mm = &memo_id[4..6];
    let dd = &memo_id[6..8];
    let formatted_date = format!("{}-{}-{}", yyyy, mm, dd);

    let mut title = format!("Daily Memo - {}", formatted_date);
    let mut summary = String::new();
    let mut summary_type: Option<String> = None;
    let mut tags = Vec::new();
    let mut weekday = String::new();
    let mut holiday = None;
    let mut updated_at = String::new();
    let mut body_content = raw.to_string();

    // --- YAML Frontmatter パース (インライン配列 ＆ ブロック配列両対応) ---
    if let Some((yaml_str, body)) = split_frontmatter(raw) {
        body_content = body;
        let mut in_tags_block = false;

        for raw_line in yaml_str.lines() {
            let line = raw_line.trim();
            if line.is_empty() {
                continue;
            }

            if in_tags_block {
                if let Some(item) = line.strip_prefix('-') {
                    let tag = unquote(item);
                    if !tag.is_empty() {
                        tags.push(tag);
                    }
                    continue;
                } else {
                    in_tags_block = false;
                }
            }

            if let Some(rest) = line.strip_prefix("title:") {
                title = unquote(rest);
            } else if let Some(rest) = line.strip_prefix("summary_type:") {
                let val = unquote(rest);
                if !val.is_empty() && val != "null" {
                    summary_type = Some(val);
                }
            } else if let Some(rest) = line.strip_prefix("summary:") {
                summary = unquote(rest);
            } else if let Some(rest) = line.strip_prefix("weekday:") {
                weekday = unquote(rest);
            } else if let Some(rest) = line.strip_prefix("holiday:") {
                let h = unquote(rest);
                if !h.is_empty() && h != "null" {
                    holiday = Some(h);
                }
            } else if let Some(rest) = line
                .strip_prefix("updated_at:")
                .or_else(|| line.strip_prefix("updatedAt:"))
            {
                updated_at = unquote(rest);
            } else if let Some(rest) = line.strip_prefix("tags:") {
                let tags_part = rest.trim();
                if tags_part.is_empty() {
                    in_tags_block = true;
                } else if tags_part.starts_with('[') && tags_part.ends_with(']') {
                    let inner = &tags_part[1..tags_part.len() - 1];
                    tags = inner
                        .split(',')
                        .map(unquote)
                        .filter(|s| !s.is_empty())
                        .collect();
                }
            }
        }
    }

    if summary.is_empty() {
        summary = "要約はありません。".to_string();
    }
    if updated_at.is_empty() {
        updated_at = formatted_date.clone();
    }

    Some(QuickMemoDto {
        id: memo_id,
        date: formatted_date.clone(),
        filename,
        content: body_content,
        raw_markdown: raw.to_string(),
        ai_summary: summary.clone(),
        frontmatter: FrontmatterDto {
            title: Some(title),
            date: formatted_date,
            weekday,
            holiday,
            summary: Some(summary),
            summary_type,
            tags,
            updated_at: Some(updated_at.clone()),
        },
        updated_at,
    })
}

pub fn load_all_memos_impl(storage_path: &str) -> Result<Vec<QuickMemoDto>, String> {
    let path = expand_env_path(storage_path);
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut memos = Vec::new();

    for entry in entries.flatten() {
        let file_path = entry.path();
        if file_path.is_file() && file_path.extension().and_then(|s| s.to_str()) == Some("md") {
            if let Ok(content_str) = fs::read_to_string(&file_path) {
                if let Some(memo) = parse_markdown_to_memo(&file_path, &content_str) {
                    memos.push(memo);
                }
            }
        }
    }

    memos.sort_by(|a, b| b.id.cmp(&a.id));
    Ok(memos)
}

pub fn save_memo_file_impl(storage_path: &str, memo: &QuickMemoDto) -> Result<(), String> {
    let dir = expand_env_path(storage_path);
    let safe_name = validate_single_filename(&memo.filename)?;
    if !safe_name.to_ascii_lowercase().ends_with(".md") {
        return Err(format!(
            "Markdown 以外のファイルは保存できません: {}",
            safe_name
        ));
    }
    let file_path = dir.join(safe_name);
    atomic_write(&file_path, memo.raw_markdown.as_bytes())
}

pub fn delete_memo_file_impl(storage_path: &str, memo_id: &str) -> Result<(), String> {
    let dir = expand_env_path(storage_path);
    let safe_id = validate_single_filename(memo_id)?;
    let filename = if safe_id.to_ascii_lowercase().ends_with(".md") {
        safe_id.to_string()
    } else {
        format!("{}.md", safe_id)
    };
    let file_path = dir.join(filename);
    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn save_app_config_impl(config_path: &str, config_json: &str) -> Result<(), String> {
    let path = expand_env_path(config_path);
    atomic_write(&path, config_json.as_bytes())
}

pub fn load_app_config_impl(config_path: &str) -> Result<String, String> {
    let path = expand_env_path(config_path);
    if !path.exists() {
        return Err(format!("File not found: {}", path.display()));
    }
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            use tauri::Manager;
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            commands::load_all_memos,
            commands::save_memo_file,
            commands::delete_memo_file,
            commands::save_app_config,
            commands::load_app_config
        ])
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// =========================================================================
// Rust ユニットテストコード (Cargo Test)
// =========================================================================
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_parse_markdown_to_memo_valid_inline_tags() {
        let raw = r#"---
title: "テストメモ"
summary: "これは要約テストです"
summary_type: "gemini-3.7-flash"
weekday: "月"
tags: ["Rust", "Tauri"]
updatedAt: "2026-08-04T12:00:00Z"
---
# 今日のメモ本文
テストコンテンツです。
"#;
        let path = Path::new("20260804.md");
        let memo = parse_markdown_to_memo(path, raw).expect("パースに成功するべきです");

        assert_eq!(memo.id, "20260804");
        assert_eq!(memo.date, "2026-08-04");
        assert_eq!(memo.filename, "20260804.md");
        assert_eq!(memo.ai_summary, "これは要約テストです");
        assert_eq!(memo.frontmatter.title, Some("テストメモ".to_string()));
        assert_eq!(
            memo.frontmatter.summary_type,
            Some("gemini-3.7-flash".to_string())
        );
        assert_eq!(memo.frontmatter.tags, vec!["Rust", "Tauri"]);
        assert!(memo.content.contains("今日のメモ本文"));
    }

    #[test]
    fn test_parse_markdown_to_memo_block_tags_and_hr() {
        let raw = "---\r\ndate: '2026-11-20'\r\nweekday: 金曜日\r\nholiday: null\r\ntags:\r\n  - 仕事\r\n  - 'React'\r\nsummary: ブロック配列のテスト\r\nsummary_type: local-fallback\r\n---\r\n\r\n# 見出し\r\n\r\n---\r\n水平線の後の本文\r\n";
        let path = Path::new("20261120.md");
        let memo = parse_markdown_to_memo(path, raw).expect("パースに成功するべきです");

        assert_eq!(memo.frontmatter.tags, vec!["仕事", "React"]);
        assert_eq!(memo.frontmatter.holiday, None);
        assert_eq!(
            memo.frontmatter.summary_type,
            Some("local-fallback".to_string())
        );
        assert!(memo.content.contains("水平線の後の本文"));
    }

    #[test]
    fn test_parse_markdown_to_memo_invalid_filename() {
        let raw = "# Hello";
        let path = Path::new("invalid_name.md");
        assert!(parse_markdown_to_memo(path, raw).is_none());
    }

    #[test]
    fn test_save_and_load_and_delete_memo_file() {
        let dir = tempdir().expect("一時ディレクトリの作成失敗");
        let dir_path = dir.path().to_str().unwrap();

        let memo = QuickMemoDto {
            id: "20260804".to_string(),
            date: "2026-08-04".to_string(),
            filename: "20260804.md".to_string(),
            content: "本文コンテンツ".to_string(),
            raw_markdown: "---\ntitle: \"20260804\"\n---\n本文コンテンツ".to_string(),
            ai_summary: "要約テキスト".to_string(),
            frontmatter: FrontmatterDto {
                title: Some("20260804".to_string()),
                date: "2026-08-04".to_string(),
                weekday: "火".to_string(),
                holiday: None,
                summary: Some("要約テキスト".to_string()),
                summary_type: Some("gemini-3.7-flash".to_string()),
                tags: vec!["Test".to_string()],
                updated_at: Some("2026-08-04".to_string()),
            },
            updated_at: "2026-08-04".to_string(),
        };

        // 保存のテスト（アトミック書き込み）
        save_memo_file_impl(dir_path, &memo).expect("保存に成功するべきです");

        // 読み込みのテスト
        let loaded = load_all_memos_impl(dir_path).expect("読み込みに成功するべきです");
        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0].id, "20260804");

        // 削除のテスト
        delete_memo_file_impl(dir_path, "20260804").expect("削除に成功するべきです");
        let after_delete = load_all_memos_impl(dir_path).expect("読み込みに成功するべきです");
        assert_eq!(after_delete.len(), 0);
    }

    #[test]
    fn test_path_traversal_rejected() {
        let dir = tempdir().expect("一時ディレクトリの作成失敗");
        let dir_path = dir.path().to_str().unwrap();

        let evil_memo = QuickMemoDto {
            id: "20260804".to_string(),
            date: "2026-08-04".to_string(),
            filename: "../evil.md".to_string(),
            content: "x".to_string(),
            raw_markdown: "x".to_string(),
            ai_summary: String::new(),
            frontmatter: FrontmatterDto {
                title: None,
                date: "2026-08-04".to_string(),
                weekday: String::new(),
                holiday: None,
                summary: None,
                summary_type: None,
                tags: Vec::new(),
                updated_at: None,
            },
            updated_at: String::new(),
        };

        assert!(save_memo_file_impl(dir_path, &evil_memo).is_err());
        assert!(delete_memo_file_impl(dir_path, "../evil").is_err());
    }

    #[test]
    fn test_expand_env_path_userprofile() {
        let expanded = expand_env_path("%USERPROFILE%\\Documents\\QuDaMemo");
        assert!(expanded.ends_with(Path::new("Documents").join("QuDaMemo")));
        assert!(!expanded.to_string_lossy().contains("%USERPROFILE%"));
    }

    #[test]
    fn test_save_and_load_app_config() {
        let dir = tempdir().expect("一時ディレクトリの作成失敗");
        let config_file_path = dir.path().join("config.json");
        let path_str = config_file_path.to_str().unwrap();

        let dummy_json = r#"{"storagePath":"%USERPROFILE%\\Documents\\QuDaMemo\\notes","geminiApiKey":"test_api_key_123"}"#;

        // 保存のテスト（アトミック書き込み）
        save_app_config_impl(path_str, dummy_json).expect("設定ファイルの保存に成功するべきです");

        // 読み込みのテスト
        let loaded =
            load_app_config_impl(path_str).expect("設定ファイルの読み込みに成功するべきです");
        assert_eq!(loaded, dummy_json);
    }
}
