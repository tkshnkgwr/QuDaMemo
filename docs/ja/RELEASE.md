# リリース手順 (RELEASE.md) - QuDaMemo

[English Version](../en/RELEASE.md) | **日本語版**

---

## 1. 事前検証プロセス

リリースビルドを行う前に、以下の各検証コマンドを順番に実行し、すべてが PASS することを確認します：

```bash
# 1. TypeScript 静的型チェック (型エラー 0 件を確認)
npm run lint

# 2. フロントエンド単体テスト実行 (Vitest)
npm run test

# 3. Vite フロントエンドビルド検証
npm run build

# 4. Tauri Rust バックエンド構文検証
cargo check --manifest-path src-tauri/Cargo.toml

# 5. Rust ネイティブ単体テスト実行
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## 2. プロダクションパッケージのビルド

```bash
# Windows ネイティブインストーラ / 実行ファイル (.exe / .msi) の生成
npx tauri build
```

ビルド成果物は `src-tauri/target/release/bundle/msi/` および `src-tauri/target/release/bundle/nsis/` 等に出力されます。

---

## 3. バージョンバンプフロー (Semantic Versioning)

バージョン更新時は、以下のファイルを一括で同期更新します：

| ファイル                             | 更新対象項目                                                   |
| :----------------------------------- | :------------------------------------------------------------- |
| `package.json`                       | `"version": "x.y.z"`                                           |
| `src-tauri/Cargo.toml`               | `version = "x.y.z"`                                            |
| `docs/ja/CHANGELOG.md`               | 新バージョンのリリースノート (日付、変更点)                    |
| `docs/en/CHANGELOG.md`               | 新バージョンの英語リリースノート                               |
| `docs/ja/TODO.md`, `docs/en/TODO.md` | リリース済み完了タスクの反映                                   |
| `README.md`, `README_JA.md`          | バージョンバッジおよび概要の同期                               |

---

## 4. GitHub Actions CI/CD 連携

本リポジトリは GitHub Actions ワークフロー（`.github/workflows/`）により自動化されています：

- **CI (`ci.yml`)**: プルリクエストやメインブランチプッシュ時に Windows 環境で自動ビルド・テスト・キャッシュ検証を実施。
- **Release (`release.yml`)**: `v*.*.*` タグのプッシュまたは手動ディスパッチにより、Windows 用インストーラを自動生成し GitHub Releases へアセット添付。
