# リリース手順 (RELEASE.md) - QuDaMemo

[English Version](../en/RELEASE.md) | **日本語版**

## 1. 事前検証プロセス
```bash
# 1. TypeScript 型チェック
npm run lint

# 2. 単体テスト実行
npm run test

# 3. Vite フロントエンドビルド検証
npm run build

# 4. Tauri Rust バックエンド構文検証
cargo check --manifest-path src-tauri/Cargo.toml
```

## 2. プロダクションパッケージのビルド
```bash
# Windows ネイティブインストーラ / 実行ファイル (.exe / .msi) の生成
npx tauri build
```
ビルド成果物は `src-tauri/target/release/` および `src-tauri/target/release/bundle/msi/` 等に出力されます。

## 3. バージョンバンプフロー (Semantic Versioning)

バージョン更新時は以下の各ファイルを一括更新します：

1. `package.json` の `"version"`
2. `src-tauri/Cargo.toml` の `version`
3. `docs/ja/CHANGELOG.md` および `docs/en/CHANGELOG.md` に新バージョンのリリースノートを記録
4. 必要に応じて `README.md`, `README_JA.md` のバッジおよび機能概要を同期


