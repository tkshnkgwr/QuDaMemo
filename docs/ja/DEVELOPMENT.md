# 開発ガイド (DEVELOPMENT.md) - QuDaMemo

[English Version](../en/DEVELOPMENT.md) | **日本語版**

---

## 1. 開発環境要件

| ツール / ランタイム | 推奨バージョン | 目的・用途                                     |
| :------------------ | :------------- | :--------------------------------------------- |
| **Node.js**         | v18.0.0 以上   | フロントエンド開発およびパッケージ実行環境     |
| **Rust**            | v1.80.0 以上   | Tauri v2 バックエンドおよびネイティブコア      |
| **npm**             | v9.0.0 以上    | 依存関係マネージャ                             |
| **OS**              | Windows 10/11  | メインターゲットプラットフォーム (WebView2)    |

---

## 2. ディレクトリ構造

```text
.
├── .agents/                 # AI エージェント用開発指示書・スキル定義
│   ├── AGENTS.md            # 開発ガイドライン
│   └── skills/              # 各種ワークスペーススキル
│       ├── git-commit/      # Git コミット規約・安全実行スキル
│       ├── markdown-table/  # Markdown テーブル垂直整列ガイド
│       ├── tauri-verification/ # Rust / フロントエンド事前検証スキル
│       └── vault-memo/      # Obsidian Vault 一時メモ保存スキル
├── src/                     # React 19 / TypeScript フロントエンド
│   ├── components/          # UI コンポーネント (エディタ, カレンダー, タイトルバー等)
│   │   └── settings/        # 設定画面用サブコンポーネント (GeneralTab, AiTab 等 5 分割)
│   ├── utils/               # ストレージ、Frontmatter 解析、祝日判定、ロガー
│   ├── types.ts             # TypeScript 型定義 (Frontmatter, QuickMemoDto, AppSettings)
│   ├── App.tsx              # メインアプリケーションコンポーネント
│   ├── main.tsx             # フロントエンドエントリポイント
│   └── index.css            # グローバルスタイル (TailwindCSS)
├── src-tauri/               # Tauri v2 Rust バックエンド
│   ├── src/                 # Rust ソースコード
│   │   ├── commands.rs      # Tauri IPC コマンドモジュール
│   │   ├── lib.rs           # コアライブラリ (パース、アトミックI/O、設定永続化)
│   │   └── main.rs          # バックエンドエントリポイント
│   ├── capabilities/        # Tauri v2 権限設定 (default.json)
│   ├── icons/               # マルチプラットフォーム用アプリアイコン
│   ├── Cargo.toml           # Rust 依存クレートおよびリリース最適化設定
│   └── tauri.conf.json      # Tauri アプリ構成ファイル (枠なし・透過・バンドル設定)
├── docs/                    # 多言語ドキュメント体系 (ja/ / en/)
├── README.md                # 英語版リポジトリ概要
├── README_JA.md             # 日本語版リポジトリ概要
├── RULES.md                 # 共通絶対遵守ルール
├── GEMINI.md                # 大賢者最優先ルール
└── package.json             # プロジェクト設定およびフロントエンド依存関係
```

---

## 3. 開発および検証コマンド一覧

### 3.1 開発モードの起動
```bash
# 依存パッケージのインストール
npm install

# Tauri デスクトップアプリの開発起動 (Hot Reload 対応)
npx tauri dev
```

### 3.2 フロントエンド検証
```bash
# TypeScript 型検査 (型エラー 0 件を確認)
npm run lint

# 単体テストの実行 (Vitest: Frontmatter 解析, 祝日判定)
npm run test

# Vite プロダクションビルド検証
npm run build
```

### 3.3 Rust バックエンド検証
```bash
# Rust 構文およびコンパイル検証
cargo check --manifest-path src-tauri/Cargo.toml

# Rust 単体テスト実行 (パース・アトミックI/O・設定保存検証)
cargo test --manifest-path src-tauri/Cargo.toml

# コードフォーマット検証
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
```

### 3.4 ドキュメント生成 (TypeDoc)
```bash
npm run doc
```
```

### 3.4 プロダクションインストーラの生成
```bash
# Windows ネイティブインストーラ (.msi / .exe) のビルド
npx tauri build
```

---

## 4. 開発ルールとワークフロー

本プロジェクトでは [RULES.md](../../RULES.md) に定義された共通絶対ルールが適用されます：

1. **自動コミット/Push の絶対禁止**: ボスからの明示的なチャット指示がない限り、Git への commit / push は行いません。
2. **Markdown テーブルの垂直整列**: すべてのテーブルは生テキスト（gVim 等）で閲覧した際にも整然と揃うよう、垂直整列を行います。
3. **パス表記の環境変数化**: ローカルパス記述時は `%USERPROFILE%` 等の環境変数を必ず使用します。
4. **迅速なドキュメント修正**: Markdown ファイル（`*.md` のみ）の編集時は、事前検証コマンドの実行を省略して迅速に対応します。
