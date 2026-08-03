# リソース計測 (FOOTPRINTS.md) - QuDaMemo

低リソース環境（スペックの限られた Windows PC 等）での動作実績データです。

## 1. メモリフットプリント (RAM Usage)
- **Node.js Express Server**: 約 35 MB
- **ブラウザ UI レンダリング (Vite/React)**: 約 45 MB
- **合計メモリ消費**: **80 MB 未満**

## 2. 描画・CPU負荷
- **インターバル制限**: 描画更新を 1秒に1回 に制御し、アイドリング時の CPU 使用率を 1% 未満に抑維持。
- **将来的 Rust (egui/eframe) 移植時の目標**: メモリ消費 15MB 以下、起動時間 50ms 以下。
