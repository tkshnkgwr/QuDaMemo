# テスト方針 (TESTING.md) - QuDaMemo

## 1. テスト原則
- **静的解析**: TypeScript の型チェック、ESLint による構文検証。
- **結合検証**: フロントエンド・バックエンド間の `/api/summarize` API 通信テスト。
- **リソース検証**: 低スペック環境を想定した描画負荷・メモリフットプリント測定。

## 2. ローカル検証プロセス
```bash
# 1. コンパイルチェック
npm run build

# 2. 型チェック・構文チェック
npx tsc --noEmit
```
