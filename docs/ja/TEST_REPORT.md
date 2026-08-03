# テスト実行レポート (TEST_REPORT.md) - QuDaMemo

## 検証日時
2026-08-03

## テスト結果サマリー

| テスト項目 | 検証内容 | 結果 | 備考 |
|---|---|---|---|
| アプリケーションコンパイル | `compile_applet` (esbuild & Vite) | **PASS** | ビルドエラーなし |
| AIモデル設定の保存 | 設定画面での `geminiModel` 変更と保存 | **PASS** | `localStorage` および `config.json` に正常反映 |
| AI要約API疎通 | バックエンド `/api/summarize` での `geminiModel` 送信 | **PASS** | 指定モデルへのフォールバック動作確認 |
| プロンプトルール統一 | デフォルトプロンプトのマイグレーション | **PASS** | 旧設定からのマイグレーション成功 |
| 低リソース動作検証 | メモリ消費量・レンダリングコスト | **PASS** | CPU負荷スパイクなし |
