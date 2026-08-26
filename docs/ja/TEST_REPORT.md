# テスト実行レポート (TEST_REPORT.md) - QuDaMemo

[English Version](../en/TEST_REPORT.md) | **日本語版**

## 検証日時
2026-08-26 (v1.1.0)

## テスト結果サマリー

| テスト項目                 | 検証内容                                              | 結果     | 備考                                            |
| :------------------------- | :---------------------------------------------------- | :------- | :---------------------------------------------- |
| TypeScript 静的型検査      | `npm run lint` (`tsc --noEmit`)                       | **PASS** | 型エラー 0 件                                   |
| フロントエンド単体テスト   | `npm run test` (Vitest: frontmatter / holidays)       | **PASS** | 全テストケースパス                              |
| Vite プロダクションビルド  | `npm run build`                                       | **PASS** | バンドル生成成功                                |
| Tauri Rust バックエンド    | `cargo check --manifest-path src-tauri/Cargo.toml`    | **PASS** | コンパイル警告・エラーなし                      |
| AIモデル設定・カスタム入力 | 設定画面での `geminiModel` 変更・手動入力・保存        | **PASS** | `localStorage` および `config.json` に正常反映  |
| AI要約API疎通              | `gemini-3.7-flash` での要約生成・接続テスト           | **PASS** | 高速レスポンス・要約正常生成                    |
| 低リソース動作検証         | メモリ消費量（80MB未満）・レンダリングコスト          | **PASS** | CPU負荷スパイクなし                             |


