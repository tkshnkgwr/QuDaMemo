# テスト方針 (TESTING.md) - QuDaMemo

[English Version](../en/TESTING.md) | **日本語版**

---

## 1. テスト原則と品質方針

QuDaMemo では、低リソース環境での高い信頼性とユーザーデータの安全性を保証するため、多層的な検証戦略を採用しています。

| テスト種別         | 対象領域                             | 主なツール / コマンド                                  | 検証基準                                      |
| :----------------- | :----------------------------------- | :----------------------------------------------------- | :-------------------------------------------- |
| **静的型解析**     | フロントエンド全コード (`*.ts, *.tsx`) | `npm run lint` (`tsc --noEmit`)                        | 型エラー 0 件                                 |
| **フロント単体**   | ユーティリティ、Frontmatter、祝日判定 | `npm run test` (Vitest)                                | パース整合性、祝日計算の正確性                |
| **Rust バックエンド** | ファイルI/O、パース、設定永続化      | `cargo test --manifest-path src-tauri/Cargo.toml`      | アトミック保存、設定二重保存、メモリリークなし |
| **Rust 構文検証**  | バックエンドコンパイル整合性         | `cargo check --manifest-path src-tauri/Cargo.toml`     | コンパイルエラー・非推奨警告なし              |
| **フロントビルド** | Vite バンドル生成                    | `npm run build`                                        | バンドル生成成功、アセット破損なし            |
| **リソース検証**   | メモリ消費量・CPU負荷                | タスクマネージャー / foot print 測定                   | アイドル時メモリ 80MB 未満、CPU 1% 未満       |

---

## 2. ローカル検証プロセス

コード変更時は、以下の手順で一括検証を実施します：

```bash
# 1. TypeScript 静的型チェック
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

> [!NOTE]
> Markdown ファイル（`*.md` のみ）の編集・更新時は、RULES.md に従い上記検証コマンドの実行を省略して即時完了とします。
