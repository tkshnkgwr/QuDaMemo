# リリース手順 (RELEASE.md) - QuDaMemo

## 1. ビルド手順
```bash
# プロダクションビルドの実行
npm run build
```
`vite build` によるフロントエンドビルドと `esbuild` による `server.ts` から `dist/server.cjs` へのコンパイルが一括で実行されます。

## 2. 起動確認
```bash
npm start
```
`node dist/server.cjs` が実行され、Port 3000 でサーバーが開始します。

## 3. バージョンバンプフロー
1. `package.json` の `version` フィールドを更新。
2. `docs/ja/CHANGELOG.md` および `docs/en/CHANGELOG.md` に新バージョンの変更点を追加。
3. リバイジョンタグを発行。
