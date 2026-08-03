# アーキテクチャ構成 (ARCHITECTURE.md) - QuDaMemo

[English Version](../en/ARCHITECTURE.md) | **日本語版**

## 1. 全体構造概要

QuDaMemo は **Vite + React 19 フロントエンド** と **Tauri v2 Rust バックエンド** の分離アーキテクチャを採用しています。

```
+-------------------------------------------------------------+
|                QuDaMemo Tauri v2 Application                |
+-------------------------------------------------------------+
| [Frontend Window]                                           |
| React 19 + TypeScript + TailwindCSS                         |
| (MemoEditor, CalendarView, SearchHeader, SettingsModal)     |
+-------------------------------------------------------------+
| [Tauri Core IPC Bridge]                                     |
+-------------------------------------------------------------+
| [Rust Native Backend (src-tauri)]                           |
| Window Management, Local Storage, Optimization Settings     |
+-------------------------------------------------------------+
```

## 2. システム境界と設計原則
- **UI / フロントエンド**: 高速なレジデンシャルメモ管理、フロントマター解析、要約連携。
- **Rust バックエンド**: ウィンドウ透過・枠なしフレームワーク、ネイティブOSバインディング。
- **リソース最適化**: バイナリサイズ削減設定（`opt-level = 'z'`, `strip = true`）。
