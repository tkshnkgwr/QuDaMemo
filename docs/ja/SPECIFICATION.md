# アプリ機能仕様書 (SPECIFICATION.md) - QuDaMemo

[English Version](../en/SPECIFICATION.md) | **日本語版**

## 1. アプリケーション概要
QuDaMemoは、Tauri v2、React 19、TypeScript、および Rust により構築された、低スペックPC環境でも超高速かつ快適に動作するデスクトップ指向の Daily Markdown Memo アプリケーションです。
本ソフトウェアは **GNU General Public License v3.0 or later (`GPL-3.0-or-later`)** のもとでオープンソースとして公開されています。

---

## 2. 画面およびウィンドウ仕様

### 2.1 デスクトップウィンドウ仕様

- **枠なし・透過表示**: `decorations: false`, `transparent: true`, `shadow: false` によるスタイリッシュなモダンUI。
- **ウィンドウサイズ ＆ 位置復元**: デフォルト 1120 × 780px（ドラッグリサイズ・ウィンドウ位置保存対応）。

### 2.2 メインワークスペース画面

- **カレンダー/リスト切替**: 月/週表示の6行カレンダーおよびメモ一覧リストビューを瞬時に切り替え。
- **1日1メモ自動判定**: `YYYYMMDD.md` 命名規則による自動ファイル生成と YAML Frontmatter の自動挿入。
- **AI要約 ＆ バックグラウンド非同期処理**:
  - Gemini API（`gemini-3.7-flash` / `gemini-3.6-pro` 等、各種最新モデル対応）または中継プロキシによる要約生成。
  - エディタの「閉じる＆一覧へ」ボタンクリック時は待ち時間 0 秒で即座に復帰し、裏側でバックグラウンド非同期処理として要約を生成・保存。

### 2.3 2カラム型カテゴリ設定画面 (SettingsModal)

- **単一責任原則に基づくサブコンポーネント構造 (`src/components/settings/`)**:
  - 📂 **全般 (GeneralTab.tsx)**: ローカル保存先フォルダ参照、ファイル命名ルール、標準 Frontmatter テンプレート、自動保存インターバル秒数。
  - 🤖 **AI・要約 (AiTab.tsx)**: Gemini API キー、使用AIモデル（`gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-2.5-pro` 等のプリセット選択およびカスタムモデル手入力）、Base URL（中継プロキシ）、AI接続テスト（直通/プロキシ二重判定）、要約生成プロンプト。
  - 🎨 **テーマ (ThemeTab.tsx)**: ダーク / ライト / システム連動切り替え、カレンダー開始曜日（月曜/日曜）。
  - 📅 **カスタム祝日 (HolidaysTab.tsx)**: 会社創立記念日や特別休日の追加・一覧表示・削除管理。
  - 📦 **バックアップ・その他 (BackupTab.tsx)**: 設定（`config.json`）のエクスポート・インポート、LocalStorage 一時キャッシュ全削除と物理 `.md` ファイル保護表示。


---

## 3. データ構造仕様 (TypeScript)

```typescript
export interface LastTestResultData {
  testedAt: string; // テスト実行日時 "YYYY-MM-DD HH:mm:ss"
  apiSuccess: boolean;
  apiMessage: string;
  apiLatency?: number;
  urlSuccess: boolean;
  urlMessage: string;
  urlLatency?: number;
}

export interface MemoFrontmatter {
  date: string; // "YYYY-MM-DD"
  weekday?: string; // "月", "火", "水"...
  holiday?: string; // 祝日名
  updated_at?: string; // 最終更新日時 "YYYY-MM-DD HH:mm:ss"
  tags?: string[];
  summary?: string;
  summary_type?: string;
}

export interface QuickMemo {
  id: string; // YYYYMMDD 文字列形式 (例: "20260731")
  date: string; // "YYYY-MM-DD"
  filename: string; // 例: "20260731.md"
  frontmatter: MemoFrontmatter;
  content: string; // Markdown本文
  rawMarkdown: string; // フロントマターを含むファイル全体のテキスト
  aiSummary: string; // AI自動要約テキスト
  updatedAt: string; // ISO形式の更新日時タイムスタンプ
}

export interface AppSettings {
  storagePath: string; // ローカル物理保存先パス (例: Documents/QuDaMemo/notes)
  configFilePath: string; // 設定ファイル絶対パス (例: Documents/QuDaMemo/config.json)
  fileNameRule: string; // ファイル命名ルール
  summaryRule: string; // AI要約ルール/プロンプト
  geminiModel: string; // 使用AIモデル
  geminiApiKey: string; // Gemini APIキー
  geminiBaseUrl?: string; // カスタムBase URL / プロキシ経由先
  activeSummaryMode?: 'api' | 'web_proxy' | 'local_fallback'; // メイン使用要約方式
  lastTestResult?: LastTestResultData; // 接続テスト実行結果とタイムスタンプ
  autoSaveIntervalSeconds?: number; // 自動保存インターバル秒数 (デフォルト10秒)
  customHolidays?: Record<string, string>; // ユーザー定義のカスタム祝日マップ ("YYYY-MM-DD": "祝日名")
  useWebFallbackIfNoKey: boolean;
  defaultFrontmatterTemplate: string;
  theme: 'light' | 'dark' | 'system';
  calendarStartDay: 'monday' | 'sunday';
  googleDriveEnabled: boolean;
  windowBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
  };
}
```

---

## 4. Rust ネイティブ IPC コマンド仕様

フロントエンドと Rust バックエンド間の高速通信インターフェースです。

| コマンド名         | 引数                                      | 返り値                     | 役割・処理概要                                                   |
| :----------------- | :---------------------------------------- | :------------------------- | :--------------------------------------------------------------- |
| `load_all_memos`   | `storage_path: String`                    | `Result<Vec<QuickMemoDto>>`| 保存先フォルダ内の全 `.md` ファイルを並列走査・高速パースして返却 |
| `save_memo_file`   | `storage_path: String, memo: QuickMemoDto`| `Result<()>`               | 単一メモファイルを指定フォルダへアトミックかつ安全に保存         |
| `delete_memo_file` | `storage_path: String, memo_id: String`   | `Result<()>`               | 指定されたメモID (`YYYYMMDD.md`) の物理ファイルをディスクから削除 |
| `save_app_config`  | `config_path: String, config_json: String`| `Result<()>`               | 設定ファイル (`config.json`) を物理ディスクへ直接保存・バックアップ|
| `load_app_config`  | `config_path: String`                     | `Result<String>`           | 設定ファイル (`config.json`) を物理ディスクから安全に読み出し     |

---

## 5. ログ ＆ ローテーション仕様
- **ログ保存先**: `[storagePath]/logs/qudamemo.log`
- **ログローテーション**: 500KB 超過時に最大3世代（`qudamemo.log`, `qudamemo.log.1`, `qudamemo.log.2`）へ自動シフト・保存。
