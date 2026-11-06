# タスク管理 (TODO.md) - QuDaMemo

[English Version](../en/TODO.md) | **日本語版**

## 進行中 / 完了タスク (Status)

### フェーズ 1: 基本機能・UIの強化

- [x] デイリーメモ自動作成 (`YYYYMMDD.md`)
- [x] Frontmatter テンプレートの動的埋め込み (`{{date}}`, `{{weekday}}` 等)
- [x] 設定のローカル物理ファイル (`config.json`) 永続化・相互同期
- [x] AI要約機能のGemini連携 (`/api/summarize`)
- [x] 設定画面における AI要約カスタマイズルールプロンプトの初期値統一
- [x] AI要約用モデル選択機能（`gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-2.5-pro` 等のプリセットおよびカスタムモデル手入力）実装
- [x] 最新AIモデル群の選定ガイド・ヒント（速度・品質の違い）の表示整備
- [x] カレンダー祝日情報の外部ファイル化およびカスタム祝日管理
- [x] 週カレンダーのツールチップ表示位置追従 (`e.clientX`, `e.clientY`)
- [x] 検索日付範囲のデフォルト当月（今月1日〜末日）設定
- [x] キャッシュ削除時の注意点表示（実ファイル非削除の明記）
- [x] アプリ概要 ＆ 使い方ガイド表示モーダルの独立
- [x] メモ編集後の画面状態維持（月/週カレンダー・通常一覧へ復帰）
- [x] YAML フロントマターヘッダーへの `updated_at` 自動記録
- [x] 一覧・画面全体のスクロールバーのダークモード対応 (`color-scheme: dark`)

### フェーズ 2: 移植準備・低リソース最適化

- [x] リアクティブ再描画の抑制 (1秒あたりのインターバル制限)
- [x] メモリ消費量の削減 (100MB未満を維持)
- [x] Tauri v2 パッケージング・ビルド検証
- [ ] バックグラウンド常駐タスクバーインジケーターのネイティブIPC検証

### v1.1.3 リリース版 (2026-10-27)

- [x] **ソフトウェアライセンスの移行 (GPL-3.0-or-later)**:
  - プロジェクトのライセンスを MIT License から **GNU General Public License v3.0 or later (`GPL-3.0-or-later`)** へ移行。
  - `LICENSE` ファイルを GPL v3 フルテキストに刷新し、`package.json`、`Cargo.toml`、`README.md`、`README_JA.md` のライセンス定義およびバッジ表示を同期更新。

### v1.1.2 リリース版 (2026-10-27)

- [x] **ドキュメント内パス環境変数化の徹底 (`Docs / Security`)**:
  - `docs/ja/CHANGELOG.md` 等の設定ファイル絶対パス記述を、RULES.md（環境変数化原則）に基づき `%USERPROFILE%\Documents\QuDaMemo\config.json` に統一。
- [x] **README ドキュメントおよびライセンス表記の整備 (`Docs`)**:
  - `README.md` および `README_JA.md` における機能概要・開発起動手順を復元し、LICENSEファイルへの詳細リンク表記を最適化。
- [x] **ワークスペース開発ルールおよびスキルの拡充 (`Rules / Skills`)**:
  - `RULES.md` および `GEMINI.md` に高速CLIツール（`ripgrep` / `fd` / `jq`）の標準利用原則を追記。
  - Obsidian Vault 一時メモ自動保存スキル（`vault-memo`）を新規配備し、スキル一覧テーブルに登録。

### v1.1.1 リリース版 (2026-09-15)

- [x] **保存先パス・設定ファイルパスの環境変数 (%USERPROFILE%) 統一 (`Storage / Config`)**:
  - デフォルト保存先パス (`%USERPROFILE%\Documents\QuDaMemo\notes`) および設定ファイルパス (`%USERPROFILE%\Documents\QuDaMemo\config.json`) を環境変数形式に統一し、環境依存・ユーザー名ハードコードを完全排除。
- [x] **高速化 ＆ Rust ネイティブ化ロードマップの策定 (`Performance / Rust`)**:
  - `load_all_memos` の Rayon マルチスレッド並列化、Rust ネイティブ全文検索、`notify` による OS カーネル直結の差分ホットリロード、ZIP バックアップ等の次期改善仕様を策定・明記。
- [x] **大賢者エージェント開発ルール ＆ スキル定義の標準化 (`Rules / Skills`)**:
  - RULES.md、GEMINI.md、AGENTS.md、および各種スキル (`git-commit`, `markdown-table`, `tauri-verification`) をプロジェクト共通規格として完全整備。
- [x] **Cargo 依存関係の整合性向上 (`Build / Cargo`)**:
  - `Cargo.lock` の `cc` クレートバージョンを更新し、Rust バックエンドビルドの安定性を強化。


### 今後の追加検討課題

#### 🚀 パフォーマンス ＆ Rust ネイティブ化
- [ ] **Rayon による全メモ並列I/O読み込み ＆ Frontmatter高速パース (`load_all_memos` のマルチスレッド化)**:
  - メモファイル群をシングルスレッド順次読み込みから `rayon` の並列イテレータ（マルチスレッド並列処理）へ刷新。数千件規模のデイリーメモがある環境でも、SSD/NVMeの性能をフル活用して起動時スキャン時間を 1/5〜1/10 に短縮
- [ ] **Rust Native 全文検索 ＆ 高速インデックス検索 (`search_memos_native`)**:
  - フロントエンド（JavaScript）で行っている全件走査フィルタリングを Rust ネイティブに移譲。大文字小文字無視、複数キーワード AND/OR、タグ照合、およびタイトル/本文の一致スコアリングを並列実行し、1万件以上のメモでもタイピング遅延ゼロ（5ms未満）の爆速インクリメンタル検索を実現
- [ ] **`notify` による保存先フォルダの常時変更監視（差分ホットリロード）**:
  - Rust の `notify` クレートを用いて保存先フォルダを非同期監視。外部エディタやクラウド同期（OneDrive / Dropbox等）によるメモの追加・更新・削除をファイルシステムイベントで直接検知し、変更のあったメモのみを差分パースして画面を自動更新（全件再スキャンの完全廃止）
- [ ] **Markdown メタ解析 ＆ ToDoタスク進捗率の Rust 事前算出**:
  - `pulldown-cmark` を活用し、メモ内の `- [ ]` / `- [x]` のタスク総数・完了数を Rust パース時に一括集計して DTO に付与。カレンダーや一覧表示時にフロントエンドが毎回正規表現パースする負荷を撤廃し、タスク完了バッジ表示を爆速化
- [ ] **バックグラウンド常駐 ＆ システムトレイ (System Tray) の Rust ネイティブ化**:
  - Tauri v2 ネイティブの `tauri::tray` メニューを実装し、ウィンドウを閉じてもメモリ消費量わずか数MBで常駐する超軽量インジケーターを実現
- [ ] **グローバルショートカット (`tauri-plugin-global-shortcut`) による即時クイックメモ呼び出し**:
  - 任意の作業中に `Ctrl + Shift + M` 等のグローバルショートカット打鍵で、0.05秒以内に本日のメモウィンドウを最前面ポップアップ表示し、即座にメモを取り始められる超高速クイック入力体験を提供
- [ ] **ローカル自動世代バックアップ ＆ ZIP圧縮アーカイブの非同期 Rust 実行**:
  - メモ保存時に UI スレッドを一切阻害せず、Rust バックグラウンドスレッドで `.qudamemo_backups/` へ世代スナップショットを非同期保存。ストレージ肥大化を防ぐため Rust ネイティブによる高速 ZIP 圧縮アーカイブもサポート
- [ ] **大容量メモ一覧の仮想スクロール ＆ チャンク転送 (IPCページネーション)**:
  - 数千日分の過去メモが存在する場合、全件を一括シリアライズしてフロントエンドへ渡すのではなく、表示月やスクロール位置に応じたオンデマンド転送を行い、WebView の初期DOM負荷とヒープメモリを最小化

#### 🔍 検索 ＆ タグ管理の強化
- [ ] **タグフィルタリング ＆ タグクラウド UI**:
  - 過去メモで使われている既存タグ一覧をドロップダウン/ポップオーバー表示し、ワンクリックで該当タグのメモを絞り込む機能

#### 📝 エディタ ＆ メディア体験の拡張
- [ ] **画像のドラッグ＆ドロップ ＆ 物理ローカル自動保存**:
  - クリップボードやドラッグ＆ドロップされた画像ファイルを `./assets/` フォルダへ自動保存し、`![image](./assets/...)` リンクを即座に挿入する機能
- [ ] **外部 `.md` ファイルのドラッグ＆ドロップ読み込み**:
  - 外部の Markdown ファイルをアプリ上へドロップして即座に表示・インポートする支援機能

#### 🛡️ データ安全性 ＆ ローカルスナップショット
- [ ] **ローカル物理メモの自動世代バックアップ**:
  - 誤編集や誤削除に備え、編集保存時に `.qudamemo_backups/` フォルダへ日次/編集時のスナップショットバックアップを自動生成・保護する機能

#### 🤖 AI ＆ ローカル連携
- [ ] **ローカルAI (Ollama / Llama.cpp) 連携オプション**:
  - インターネット非接続環境でも完全ローカルで動作する要約エンジン連携
- [ ] **モバイルビューレスポンシブ最適化**

#### 🛠️ システム基盤 ＆ 堅牢性向上（総点検による改善課題）
- [ ] **【最優先】パス環境変数（`%USERPROFILE%` / `%APPDATA%` / `$HOME`）の Rust 側実行時自動展開エンジンの実装**:
  - 対象ファイル: `src-tauri/src/lib.rs`, `src-tauri/src/commands.rs`
  - 課題: `DEFAULT_SETTINGS` で `%USERPROFILE%\Documents\QuDaMemo` を指定しているが、Rust 標準の `Path::new` や `std::fs` は Windows 環境変数文字列を展開しないため、新規環境起動時や手動入力時にリテラル名フォルダが作成されたりパスエラーになるリスクがある。
  - 対策: `resolve_path(raw_path: &str) -> PathBuf` を実装し、すべてのネイティブコマンド（`load_all_memos`, `save_memo_file`, `delete_memo_file`, `save_app_config`, `load_app_config`）の入口で OS 環境変数を安全に展開・解決する。
- [ ] **【型安全性】フロントエンド設定画面における `any` 型の完全排除と `LastTestResultData` 型への統一**:
  - 対象ファイル: `src/components/SettingsModal.tsx`, `src/components/settings/AiTab.tsx`
  - 課題: 接続テスト結果ステート（`testResult`）が `useState<any>` や `setTestResult: React.Dispatch<React.SetStateAction<any>>` と暫定的な `any` 型で宣言されている。
  - 対策: `src/types.ts` に定義済みの `LastTestResultData | null` 型へ統一し、型安全性を最大化。
- [ ] **【堅牢化】Rust 側 YAML フロントマターパーサーの強化（複数行・改行・エスケープ対応）**:
  - 対象ファイル: `src-tauri/src/lib.rs` (`parse_markdown_to_memo`)
  - 課題: 行頭単純前方一致（`starts_with`）によるパースのため、要約文に改行が含まれる場合やタグが複数行リスト（`- tag1\n- tag2`）の場合に正確に抽出できない可能性がある。
  - 対策: フロントエンド（`js-yaml`）と同様に、複数行・インデント・エスケープ文字を含む YAML フロントマターを安全に双方向パースできるロジックへ強化。
- [ ] **【信頼性】二重バックアップ書き込み（`notes/config.json`）時のエラーハンドリング・ログ出力追加**:
  - 対象ファイル: `src/utils/fileStorage.ts` (`saveConfigFileToDisk`)
  - 課題: ノートフォルダ直下への二重バックアップ保存失敗時に `.catch(() => {})` で例外を握り潰している。
  - 対策: `logger.warn` を追加し、バックアップ書き込み失敗時にもアプリログビューアから原因を追跡可能にする。
- [ ] **【品質保証】CI/CD 自動テストパイプラインへの Rust テスト（`cargo test`）統合**:
  - 対象ファイル: `.github/workflows/ci.yml`（または各種ビルドスクリプト）
  - 課題: 現在の CI ワークフローでは `npm run lint` や `cargo check` はあるが `cargo test` の自動実行ステップが不足している。
  - 対策: `cargo test --manifest-path src-tauri/Cargo.toml` を CI ジョブへ正式追加し、メモ保存・パース・設定ファイル入出力のテストをコミット/PR毎に自動担保。
