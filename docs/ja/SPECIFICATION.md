# アプリ機能仕様書 (SPECIFICATION.md) - QuDaMemo

[English Version](../en/SPECIFICATION.md) | **日本語版**

---

## 1. アプリケーション概要

QuDaMemo は、Tauri v2、React 19、TypeScript、および Rust により構築された、低スペックPC環境でも超高速かつ軽快に動作するデスクトップ指向の Daily Markdown Memo アプリケーションです。
ローカルの Markdown ファイル（`YYYYMMDD.md`）をそのままデータソースとし、Obsidian 等の外部エディタとも完全互換を保ちながら、最新の Gemini AI モデルによる即時要約機能を提供します。

---

## 2. 画面およびウィンドウ仕様

### 2.1 デスクトップウィンドウ仕様

- **枠なし・透過表示**: `decorations: false`, `transparent: true`, `shadow: false` によるスタイリッシュなモダンフレームレスUI。
- **ウィンドウサイズ ＆ 位置復元**: デフォルト 1120 × 780px（ドラッグ移動・端面リサイズ・ウィンドウ位置保存対応）。
- **タイトルバーコントロール**:
  - ウィンドウ最小化・最大化・閉じるボタン。
  - テーマ切り替えリストドロップダウン（ライト / ダーク / OS設定連動）。
  - ヘルプドロップダウンメニュー（ショートカット一覧 `F1`、ログビューア、バージョンダイアログ）。
  - 設定ボタン（歯車アイコン）。

### 2.2 メインワークスペース画面

- **カレンダー / リスト表示切替**:
  - **月カレンダー**: 6行マトリクス表示。祝日名表示、タスク進捗状況、選択日付のメモ状態を可視化。
  - **週カレンダー**: 直近7日間のメモおよびホバー時の動的ツールチップ（`e.clientX`, `e.clientY` 追従）。
  - **メモ一覧リスト**: 日付逆順のカードリスト。タイトル、AI要約バッジ、タグ、更新日時を表示。
- **1日1メモ自動判定 ＆ 生成**:
  - ファイル命名規則: `YYYYMMDD.md`（例: `20261108.md`）。
  - YAML Frontmatter 自動挿入（`title`, `date`, `weekday`, `holiday`, `tags`, `updated_at`）。
- **検索 ＆ 絞り込みヘッダー (SearchHeader)**:
  - フリーワード全文検索（タイトル・本文・要約・タグ）。
  - 日付範囲ピッカー（デフォルトは「当月1日〜末日」）。
- **AI要約 ＆ バックグラウンド非同期処理**:
  - Gemini API（`gemini-3.7-flash`, `gemini-2.0-flash` 等、カスタム手動入力対応）による本文要約生成。
  - エディタの「閉じる＆一覧へ」ボタンクリック時は待ち時間 0 秒で即座に一覧/カレンダーへ復帰し、バックグラウンド非同期処理として要約を生成・保存。
  - メモ編集後の画面状態維持（月/週カレンダー・通常一覧のうち、開いた元の画面へ正確に復帰）。

### 2.3 2カラム型カテゴリ設定画面 (SettingsModal)

単一責任原則に基づき 5 つのサブコンポーネントに分離・モジュール化されています：

| タブ名           | コンポーネント       | 主な設定項目・機能                                                            |
| :--------------- | :------------------- | :---------------------------------------------------------------------------- |
| 📂 **全般**      | `GeneralTab.tsx`     | 保存先フォルダ参照、ファイル命名規則、Frontmatterテンプレート、自動保存秒数    |
| 🤖 **AI・要約**  | `AiTab.tsx`          | Gemini APIキー、使用AIモデル選択/手動入力、Base URLプロキシ、二重接続テスト   |
| 🎨 **テーマ**    | `ThemeTab.tsx`       | ダーク / ライト / システム連動切り替え、週の開始曜日（月曜 / 日曜）           |
| 📅 **カスタム祝日** | `HolidaysTab.tsx` | 日本の祝日表示、会社創立記念日等のカスタム祝日の新規登録・一覧・削除          |
| 📦 **バックアップ** | `BackupTab.tsx`   | 設定（`config.json`）のエクスポート・インポート、キャッシュ削除と実ファイル保護明記 |

### 2.4 ヘルプ ＆ システムダイアログ

- **キーボードショートカットモーダル (`KeyboardShortcutsModal.tsx`)**:
  - `F1` またはヘルプメニューから呼び出し。全ショートカットキーの一覧表を表示。
- **ログビューアモーダル (`LogViewerModal.tsx`)**:
  - `qudamemo.log` の内容をリアルタイム表示。ログの再読込、クリップボードコピー、クリアに対応。
- **QuDaMemo についてダイアログ (`AboutModal.tsx`)**:
  - アプリバージョン、Tauri v2 + Rust エンジン、React 19 / Vite 構成、GPL-3.0-or-later ライセンスを表示。
- **アプリ概要 ＆ 使い方ガイドモーダル (`AppOverviewModal.tsx`)**:
  - アプリの基本思想、AIモデル選定ガイド（3.7 Flash の速度・品質優位性）、Obsidian 連携手順を案内。

---

## 3. Rust ネイティブ IPC 仕様

| コマンド名          | 引数                                      | 返り値                          | 説明                                                           |
| :------------------ | :---------------------------------------- | :------------------------------ | :------------------------------------------------------------- |
| `load_all_memos`    | `storage_path: String`                    | `Result<Vec<QuickMemoDto>, String>` | 保存先ディレクトリ内の全 `.md` ファイルを走査・パースして返却   |
| `save_memo_file`    | `storage_path: String, memo: QuickMemoDto`| `Result<(), String>`            | 一時ファイル作成後にアトミックリネームでメモを物理保存         |
| `delete_memo_file`  | `storage_path: String, memo_id: String`   | `Result<(), String>`            | 対象の `YYYYMMDD.md` ファイルを物理削除                        |
| `save_app_config`   | `config_path: String, config_json: String`| `Result<(), String>`            | `%USERPROFILE%\Documents\QuDaMemo\config.json` 等へ物理保存   |
| `load_app_config`   | `config_path: String`                     | `Result<String, String>`        | 物理設定ファイルから設定 JSON 文字列を読み込み                 |

---

## 4. データ構造仕様

### 4.1 TypeScript 型定義 (`src/types.ts`)

```typescript
export interface FrontmatterDto {
  title?: string;
  date: string; // "YYYY-MM-DD"
  weekday?: string; // "月", "火", "水"...
  holiday?: string; // 祝日名
  summary?: string; // AI要約テキスト
  tags?: string[];
  updated_at?: string; // 最終更新日時 "YYYY-MM-DD HH:mm:ss"
}

export interface QuickMemoDto {
  id: string; // "YYYYMMDD"
  date: string; // "YYYY-MM-DD"
  filename: string; // "YYYYMMDD.md"
  content: string; // マークダウン本文
  rawMarkdown: string; // Frontmatterを含む全体Markdown
  aiSummary: string; // 要約テキスト
  frontmatter: FrontmatterDto;
  updatedAt: string;
}

export interface LastTestResultData {
  testedAt: string; // "YYYY-MM-DD HH:mm:ss"
  apiSuccess: boolean;
  apiMessage: string;
  apiLatency?: number;
  urlSuccess: boolean;
  urlMessage: string;
  urlLatency?: number;
}

export interface AppSettings {
  storagePath: string; // 例: "%USERPROFILE%\\Documents\\QuDaMemo\\notes"
  configFilePath: string; // 例: "%USERPROFILE%\\Documents\\QuDaMemo\\config.json"
  fileNameRule: string; // ファイル命名ルール (デフォルト: "YYYYMMDD")
  summaryRule: string; // AI要約ルール/プロンプト
  geminiModel: string; // 使用AIモデル名
  geminiApiKey: string; // Gemini APIキー
  geminiBaseUrl?: string; // カスタムBase URL / プロキシ経由先
  activeSummaryMode?: 'api' | 'web_proxy' | 'local_fallback';
  lastTestResult?: LastTestResultData;
  autoSaveIntervalSeconds?: number; // デフォルト 10 秒
  customHolidays?: Record<string, string>; // "YYYY-MM-DD": "祝日名"
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

## 5. ログ ＆ ローテーション仕様

- **ログ保存先**: `[storagePath]/logs/qudamemo.log`
- **ログローテーション**: 500KB 超過時に最大3世代（`qudamemo.log`, `qudamemo.log.1`, `qudamemo.log.2`）へ自動シフト・保存。
- **ログ閲覧**: タイトルバーのヘルプメニューから `LogViewerModal` を開いてリアルタイム確認が可能。
