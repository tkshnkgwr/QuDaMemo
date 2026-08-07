# 開発ガイド (DEVELOPMENT.md) - QuDaMemo

[English Version](../en/DEVELOPMENT.md) | **日本語版**

## 1. 開発環境要件
- **Node.js**: v18.0.0 以上
- **Rust**: v1.80.0 以上 (Tauri v2 用)
- **パッケージマネージャ**: npm

## 2. ディレクトリ構造
```
.
├── .agents/                 # AI エージェント用開発指示書 (AGENTS.md)
├── src/                     # React 19 / TypeScript フロントエンド
│   ├── components/          # UIコンポーネント (MemoEditor, CalendarView 等)
│   │   └── settings/        # 設定画面用サブコンポーネント (GeneralTab, AiTab 等)
│   ├── utils/               # ストレージおよびヘルパー関数
│   ├── types.ts             # 型定義
│   ├── App.tsx              # アプリメインコンポーネント
│   └── main.tsx             # フロントエンドエントリポイント
├── src-tauri/               # Tauri v2 Rust バックエンド
│   ├── src/                 # main.rs, lib.rs
│   ├── capabilities/        # Tauri v2 権限設定
│   ├── icons/               # アプリアイコン
│   ├── Cargo.toml           # Rust 依存関係・最適化設定
│   └── tauri.conf.json      # Tauri アプリ構成ファイル
├── docs/                    # 多言語ドキュメント体系 (ja/ / en/)
└── package.json
```

## 3. 開発およびビルド手順

### 開発モードの起動
```bash
npx tauri dev
```

### フロントエンド単体検証
```bash
npm run lint
npm run build
```

### Tauri Rust バックエンド検証
```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

### プロダクションパッケージのビルド
```bash
npx tauri build
```
