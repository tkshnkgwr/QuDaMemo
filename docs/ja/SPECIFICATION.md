# アプリ機能仕様書 (SPECIFICATION.md) - QuDaMemo

[English Version](../en/SPECIFICATION.md) | **日本語版**

## 1. アプリケーション概要
QuDaMemoは、Tauri v2、React 19、TypeScript、および Rust により構築された、低スペックPC環境でも超高速かつ快適に動作するデスクトップ指向の Daily Markdown Memo アプリケーションです。

---

## 2. 画面およびウィンドウ仕様

### 2.1 デスクトップウィンドウ仕様
- **枠なし・透過表示**: `decorations: false`, `transparent: true`, `shadow: false` によるスタイリッシュなモダンUI。
- **ウィンドウサイズ ＆ 位置復元**: デフォルト 1120 × 780px（ドラッグリサイズ・ウィンドウ位置保存対応）。

### 2.2 メインワークスペース画面
- **カレンダー/リスト切替**: 月/週表示の6行カレンダーおよびメモ一覧リストビューを瞬時に切り替え。
- **1日1メモ自動判定**: `YYYYMMDD.md` 命名規則による自動ファイル生成と YAML Frontmatter の自動挿入。
- **AI要約 ＆ バックグラウンド非同期処理**:
  - Gemini API（`gemini-3.6-flash` / `gemini-3.6-pro` 等）または中継プロキシによる要約生成。
  - エディタの「閉じる＆一覧へ」ボタンクリック時は待ち時間 0 秒で即座に復帰し、裏側でバックグラウンド非同期処理として要約を生成・保存。

### 2.3 2カラム型カテゴリ設定画面 (SettingsModal)
- **カテゴリ切り替えタブ**:
  - 📂 **全般 (General)**: ローカル保存先フォルダ参照（設定済みパス優先表示）、ファイル命名ルール、カレンダー開始曜日、自動保存タイミング（秒数カスタマイズ、0不可）。
  - 🤖 **AI・要約 (AI Mode)**: Gemini API キー、Base URL（中継プロキシ）、使用AIモデル、要約ルール、AI接続テスト（二重判定＆日時保存）、メイン要約方式の選択（API直通 / Webプロキシ / ローカル）。
  - 🎨 **テーマ (Theme)**: ダーク / ライト / システム連動切り替え。
  - 📦 **その他 (Backup)**: 設定（`config.json`）のエクスポート・インポート、Google Drive 連携機能枠。

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

export interface AppSettings {
  storagePath: string; // ローカル物理保存先パス
  configFilePath: string; // 設定ファイルパス (./config.json)
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

## 4. ログ ＆ ローテーション仕様
- **ログ保存先**: `[storagePath]/logs/qudamemo.log`
- **ログローテーション**: 500KB 超過時に最大3世代（`qudamemo.log`, `qudamemo.log.1`, `qudamemo.log.2`）へ自動シフト・保存。
