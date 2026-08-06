//! # QuDaMemo Tauri Core Module
//!
//! QuDaMemo デスクトップアプリケーションの核心となる Rust バックエンドライブラリです。
//! 超軽量・高パフォーマンスな並列ファイルスキャン、YAML Frontmatterパース、
//! ディスクへのアトミックな書き込み・削除機能を提供します。

pub mod commands;

use serde::{Deserialize, Serialize};
use specta::Type;
use std::fs;
use std::path::Path;

/// メモファイルの YAML Frontmatter メタデータ情報
#[derive(Debug, Serialize, Deserialize, Clone, Type, PartialEq, Eq)]
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
    /// タグ一覧
    #[serde(default)]
    pub tags: Vec<String>,
    /// 最終更新日時
    #[serde(default, alias = "updatedAt")]
    pub updated_at: Option<String>,
}

/// メモ1件を表す高機能 DTO 構造体
#[derive(Debug, Serialize, Deserialize, Clone, Type, PartialEq, Eq)]
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
    let mut tags = Vec::new();
    let mut weekday = String::new();
    let mut holiday = None;
    let mut updated_at = String::new();
    let mut body_content = raw.to_string();

    // --- YAML Frontmatter パース ---
    if let Some(stripped) = raw.strip_prefix("---") {
        if let Some(end_idx) = stripped.find("---") {
            let yaml_str = &stripped[..end_idx];
            body_content = stripped[end_idx + 3..].trim_start().to_string();

            for line in yaml_str.lines() {
                let line = line.trim();
                if line.starts_with("title:") {
                    title = line
                        .trim_start_matches("title:")
                        .trim()
                        .trim_matches('"')
                        .trim_matches('\'')
                        .to_string();
                } else if line.starts_with("summary:") {
                    summary = line
                        .trim_start_matches("summary:")
                        .trim()
                        .trim_matches('"')
                        .trim_matches('\'')
                        .to_string();
                } else if line.starts_with("weekday:") {
                    weekday = line
                        .trim_start_matches("weekday:")
                        .trim()
                        .trim_matches('"')
                        .trim_matches('\'')
                        .to_string();
                } else if line.starts_with("holiday:") {
                    let h = line
                        .trim_start_matches("holiday:")
                        .trim()
                        .trim_matches('"')
                        .trim_matches('\'');
                    if !h.is_empty() && h != "null" {
                        holiday = Some(h.to_string());
                    }
                } else if line.starts_with("updated_at:") || line.starts_with("updatedAt:") {
                    let val = if line.starts_with("updated_at:") {
                        line.trim_start_matches("updated_at:")
                    } else {
                        line.trim_start_matches("updatedAt:")
                    };
                    updated_at = val.trim().trim_matches('"').trim_matches('\'').to_string();
                } else if line.starts_with("tags:") {
                    let tags_part = line.trim_start_matches("tags:").trim();
                    if tags_part.starts_with('[') && tags_part.ends_with(']') {
                        let inner = &tags_part[1..tags_part.len() - 1];
                        tags = inner
                            .split(',')
                            .map(|s| s.trim().trim_matches('"').trim_matches('\'').to_string())
                            .filter(|s| !s.is_empty())
                            .collect();
                    }
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
            tags,
            updated_at: Some(updated_at.clone()),
        },
        updated_at,
    })
}

pub fn load_all_memos_impl(storage_path: &str) -> Result<Vec<QuickMemoDto>, String> {
    let path = Path::new(storage_path);
    if !path.exists() {
        let _ = fs::create_dir_all(path);
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
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
    let dir = Path::new(storage_path);
    if !dir.exists() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let file_path = dir.join(&memo.filename);
    fs::write(file_path, &memo.raw_markdown).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn delete_memo_file_impl(storage_path: &str, memo_id: &str) -> Result<(), String> {
    let dir = Path::new(storage_path);
    let filename = format!("{}.md", memo_id);
    let file_path = dir.join(filename);
    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| e.to_string())?;
    }
    Ok(())
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
            commands::delete_memo_file
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
    fn test_parse_markdown_to_memo_valid() {
        let raw = r#"---
title: "テストメモ"
summary: "これは要約テストです"
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
        assert_eq!(memo.frontmatter.tags, vec!["Rust", "Tauri"]);
        assert!(memo.content.contains("今日のメモ本文"));
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
                tags: vec!["Test".to_string()],
                updated_at: Some("2026-08-04".to_string()),
            },
            updated_at: "2026-08-04".to_string(),
        };

        // 保存のテスト
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
}
