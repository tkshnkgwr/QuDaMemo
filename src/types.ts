export interface MemoFrontmatter {
  date: string; // YYYY-MM-DD 形式
  weekday: string; // 例: "金曜日"
  holiday: string | null; // 例: "山の日" または null
  tags: string[];
  summary?: string; // AI要約テキスト (YAMLフロントマター保存用)
  summary_type?: string; // 例: "gemini-3.6-flash", "gemini-3.6-pro", "local-fallback"
  [key: string]: unknown;
}

export interface QuickMemo {
  id: string; // YYYYMMDD 文字列形式 (例: 20260731)
  date: string; // YYYY-MM-DD
  filename: string; // 例: 20260731.md
  frontmatter: MemoFrontmatter;
  content: string; // Markdown本文
  rawMarkdown: string; // フロントマターを含むファイル全体のテキスト
  aiSummary: string; // AI自動要約テキスト (編集不可)
  updatedAt: string; // ISO形式の更新日時タイムスタンプ
}

export interface LastTestResultData {
  testedAt: string; // テスト実行日時 "YYYY-MM-DD HH:mm:ss"
  apiSuccess: boolean;
  apiMessage: string;
  apiLatency?: number;
  urlSuccess: boolean;
  urlMessage: string;
  urlLatency?: number;
}

// UPDATE [2026-08-03]: アプリと同階層の設定ファイル保存(configFilePath)、要約ルール(summaryRule)、AIモデル(geminiModel)、Base URLに対応
export interface AppSettings {
  storagePath: string; // 例: "C:\\Users\\AppData\\Roaming\\QuDaMemo\\notes" または "./notes"
  configFilePath: string; // 例: "./config.json" (アプリと同階層)
  fileNameRule: string; // 例: "YYYYMMDD.md" または "{{date}}.md"
  summaryRule: string; // 要約生成時のルール/プロンプト
  geminiModel: string; // AI要約に使用するGeminiモデル (例: "gemini-3.6-flash")
  geminiApiKey: string; // UI上ではマスク表示
  geminiBaseUrl?: string; // カスタムAPI Base URL (例: "https://generativelanguage.googleapis.com" または社内プロキシ)
  activeSummaryMode?: 'api' | 'web_proxy' | 'local_fallback'; // 使用する要約方式 (API直通 / Webプロキシ / ローカル)
  lastTestResult?: LastTestResultData; // 最終接続テスト結果・日時
  useWebFallbackIfNoKey: boolean;
  defaultFrontmatterTemplate: string;
  theme: 'dark' | 'light' | 'system';
  calendarStartDay: 'monday' | 'sunday';
  autoSaveIntervalSeconds?: number; // 自動保存までのタイマー秒数 (デフォルト: 10秒, 0不可)
  googleDriveEnabled: boolean;
  windowBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
  };
}

export type ActiveViewMode = 'list' | 'calendar_month' | 'calendar_week' | 'editor' | 'settings';

export interface SearchFilter {
  keyword: string;
  tag: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface JapaneseHoliday {
  date: string; // YYYY-MM-DD
  name: string;
}
