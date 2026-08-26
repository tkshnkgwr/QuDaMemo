# リソース計測 (FOOTPRINTS.md) - QuDaMemo

[English Version](../en/FOOTPRINTS.md) | **日本語版**

低リソース環境（スペックの限られた Windows PC 等）での動作実績データです。

## 1. メモリフットプリント (RAM Usage)

- **Tauri v2 Rust バックエンド**: 約 10〜15 MB
- **WebView2 フロントエンド (React 19 / Vite)**: 約 45〜65 MB
- **合計メモリ消費**: **80 MB 未満（アイドル時）**

## 2. 描画・CPU負荷

- **インターバル制限**: アイドル時の定期更新を 1秒に1回 に抑制し、CPU 使用率を 1% 未満に維持。
- **最適化ビルド設定**: `opt-level = 'z'`, `lto = true`, `codegen-units = 1`, `strip = true` によりバイナリサイズおよびランタイム負荷を最小化。


