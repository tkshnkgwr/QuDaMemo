# Application Specification (SPECIFICATION.md) - QuDaMemo

**English Version** | [日本語版](../ja/SPECIFICATION.md)

## 1. Application Overview
QuDaMemo is an ultra-fast, lightweight daily Markdown note desktop application built with Tauri v2, React 19, TypeScript, and Rust, optimized for high performance even on lower-spec PC environments.

---

## 2. Interface and Window Specification

### 2.1 Desktop Window
- **Frameless & Transparent**: Stylish modern UI with `decorations: false`, `transparent: true`, and `shadow: false`.
- **Window Geometry**: Default size 1120 × 780px with drag-resize and persistent bounds restoration.

### 2.2 Main Workspace
- **Calendar & List Views**: Instant switching between 6-row monthly/weekly calendar view and note list view.
- **Auto Daily Note**: Automatic file creation with `YYYYMMDD.md` naming convention and YAML Frontmatter insertion.
- **AI Summarization & Background Processing**:
  - Summarization using Gemini API (`gemini-3.6-flash`, `gemini-3.6-pro`) or Custom Base URL proxy.
  - Zero-wait instant navigation on "Close & Back to List" with asynchronous background summarization.

### 2.3 2-Column Category Settings Modal (SettingsModal)
- **Category Tabs**:
  - 📂 **General**: Local storage folder picker (prioritizes current path), filename template, calendar start day, customizable auto-save delay (seconds).
  - 🤖 **AI & Summary**: Gemini API key, Base URL (Proxy), AI model, prompt rules, dual AI connection test (with timestamps), summary mode selector (API / Web-Proxy / Local).
  - 🎨 **Theme**: Dark / Light / System auto-switch.
  - 📦 **Backup & Advanced**: Export / Import settings (`config.json`), Google Drive sync placeholder.

---

## 3. Data Structure Specification (TypeScript)

```typescript
export interface LastTestResultData {
  testedAt: string; // Timestamp "YYYY-MM-DD HH:mm:ss"
  apiSuccess: boolean;
  apiMessage: string;
  apiLatency?: number;
  urlSuccess: boolean;
  urlMessage: string;
  urlLatency?: number;
}

export interface AppSettings {
  storagePath: string; // Local storage path (e.g., Documents/QuDaMemo/notes)
  configFilePath: string; // Settings file absolute path (e.g., Documents/QuDaMemo/config.json)
  fileNameRule: string; // Naming template
  summaryRule: string; // AI summary prompt
  geminiModel: string; // Selected Gemini model
  geminiApiKey: string; // Masked secret
  geminiBaseUrl?: string; // Custom Base URL / Proxy endpoint
  activeSummaryMode?: 'api' | 'web_proxy' | 'local_fallback'; // Selected summary mode
  lastTestResult?: LastTestResultData; // Connection test result & timestamp
  autoSaveIntervalSeconds?: number; // Auto-save delay seconds (Default: 10s)
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

## 4. Logger & Rotation Specification
- **Log Path**: `[storagePath]/logs/qudamemo.log`
- **Rotation**: Shifts to up to 3 generations (`qudamemo.log`, `qudamemo.log.1`, `qudamemo.log.2`) when exceeding 500KB.
