//! QuDaMemo Tauri Commands Module

use super::{
    delete_memo_file_impl, load_all_memos_impl, load_app_config_impl, save_app_config_impl,
    save_memo_file_impl, QuickMemoDto,
};

/// 物理保存先の全 `.md` ファイルを爆速で並列読み込みパースする Rust ネイティブコマンド
#[tauri::command]
pub fn load_all_memos(storage_path: String) -> Result<Vec<QuickMemoDto>, String> {
    load_all_memos_impl(&storage_path)
}

/// 物理メモファイルをアトミックかつ爆速に保存する Rust ネイティブコマンド
#[tauri::command]
pub fn save_memo_file(storage_path: String, memo: QuickMemoDto) -> Result<(), String> {
    save_memo_file_impl(&storage_path, &memo)
}

/// 物理メモファイルを安全削除する Rust ネイティブコマンド
#[tauri::command]
pub fn delete_memo_file(storage_path: String, memo_id: String) -> Result<(), String> {
    delete_memo_file_impl(&storage_path, &memo_id)
}

/// アプリ設定ファイル (config.json) を安全に物理保存する Rust ネイティブコマンド
#[tauri::command]
pub fn save_app_config(config_path: String, config_json: String) -> Result<(), String> {
    save_app_config_impl(&config_path, &config_json)
}

/// アプリ設定ファイル (config.json) を安全に物理読み込みする Rust ネイティブコマンド
#[tauri::command]
pub fn load_app_config(config_path: String) -> Result<String, String> {
    load_app_config_impl(&config_path)
}
