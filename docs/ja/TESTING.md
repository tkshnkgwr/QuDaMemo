# テスト方針 (TESTING.md) - QuDaMemo

[English Version](../en/TESTING.md) | **日本語版**

## 1. テスト原則

- **静的解析**: TypeScript の型チェック (`npm run lint`) による構文・型安全性の検証。
- **単体テスト**: Vitest (`npm run test`) による Frontmatter パースおよび祝日判定ロジックの網羅テスト。
- **ビルド検証**: Vite フロントエンドビルド (`npm run build`) および Tauri Rust バックエンドチェック (`cargo check`)。
- **リソース検証**: 低スペック環境を想定した描画負荷・メモリフットプリント測定。

## 2. ローカル検証プロセス
```bash
# 1. TypeScript 型チェック
npm run lint

# 2. 単体テスト実行 (Vitest)
npm run test

# 3. Vite フロントエンドビルド
npm run build

# 4. Tauri Rust バックエンド検証
cargo check --manifest-path src-tauri/Cargo.toml
```

