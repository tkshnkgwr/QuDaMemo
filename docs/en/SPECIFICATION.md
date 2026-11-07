# Functional Specification (SPECIFICATION.md) - QuDaMemo

**English Version** | [日本語版](../ja/SPECIFICATION.md)

---

## 1. Application Overview

QuDaMemo is a desktop-oriented Daily Markdown Memo application built with Tauri v2, React 19, TypeScript, and Rust, engineered for ultra-fast, lightweight performance on resource-constrained PCs.
Directly utilizing local markdown files (`YYYYMMDD.md`) as its primary data store, it maintains full bidirectional interoperability with external tools like Obsidian while providing on-demand summarization powered by cutting-edge Gemini AI models.

---

## 2. Window & UI Specifications

### 2.1 Desktop Window Specifications

- **Frameless & Transparent View**: Sleek modern interface configured with `decorations: false`, `transparent: true`, and `shadow: false`.
- **Window Dimensions & Position Restoration**: Default size 1120 × 780px (supports native dragging, edge resizing, and session position memory).
- **TitleBar Controls**:
  - Minimize, Maximize, and Close window controls.
  - Theme switching dropdown menu (Light / Dark / System sync).
  - Help dropdown menu (Shortcuts list `F1`, Log Viewer, Version dialog).
  - Settings button (gear icon).

### 2.2 Main Workspace

- **Calendar / List View Switching**:
  - **Month Calendar**: 6-week matrix layout showing holiday labels, task progress indicators, and note presence for each day.
  - **Week Calendar**: 7-day responsive strip featuring cursor-following tooltips (`e.clientX`, `e.clientY`).
  - **Memo List**: Chronologically inverted card list showing note title, AI summary badge, tags, and last update timestamp.
- **Single-Day-Single-Memo Automated Workflow**:
  - Naming rule: `YYYYMMDD.md` (e.g. `20261108.md`).
  - Automated YAML frontmatter injection (`title`, `date`, `weekday`, `holiday`, `tags`, `updated_at`).
- **Search & Filter Header (SearchHeader)**:
  - Incremental full-text keyword search across titles, contents, summaries, and tags.
  - Date range picker defaulting to the current month (1st to last day).
- **AI Summary & Asynchronous Background Processing**:
  - On-demand summary generation via Gemini API (`gemini-3.7-flash`, `gemini-2.0-flash`, or custom models).
  - Zero-wait editor exit: Clicking "Close & Return to List" returns to the list/calendar instantly without waiting for AI processing, running the summary in the background.
  - Preserves view state upon closing editor (returns accurately to monthly/weekly calendar or list).

### 2.3 Modular Two-Column Settings Modal (SettingsModal)

Decomposed into 5 focused sub-components following Single Responsibility principles:

| Tab Name             | Component            | Core Features & Options                                                               |
| :------------------- | :------------------- | :------------------------------------------------------------------------------------ |
| 📂 **General**       | `GeneralTab.tsx`     | Storage path directory picker, file naming rule, Frontmatter template, auto-save int |
| 🤖 **AI & Summary**  | `AiTab.tsx`          | Gemini API key, AI model preset/manual input, proxy Base URL, dual connection testing |
| 🎨 **Theme**         | `ThemeTab.tsx`       | Dark / Light / System theme selection, first day of the week (Monday / Sunday)        |
| 📅 **Custom Holidays** | `HolidaysTab.tsx`  | Official holidays display, registration, listing, and deletion of user custom holidays |
| 📦 **Backup & Misc** | `BackupTab.tsx`      | Config (`config.json`) export/import, cache cleanup with explicit physical note safety|

### 2.4 Help & System Dialogs

- **Keyboard Shortcuts Modal (`KeyboardShortcutsModal.tsx`)**:
  - Invoked via `F1` or Help menu; displays a complete cheatsheet of keybindings.
- **Log Viewer Modal (`LogViewerModal.tsx`)**:
  - Real-time viewer for `qudamemo.log` supporting reload, clipboard copy, and log clearing.
- **About QuDaMemo Dialog (`AboutModal.tsx`)**:
  - Displays application version, Tauri v2 + Rust core, React 19 / Vite stack, and GPL-3.0-or-later license.
- **App Overview & Guide Modal (`AppOverviewModal.tsx`)**:
  - Introduces application concepts, AI model selection guide (speed & quality benefits of 3.7 Flash), and Obsidian integration tips.

---

## 3. Rust Native IPC Command Specification

| Command Name        | Arguments                                 | Return Type                     | Description                                                                 |
| :------------------ | :---------------------------------------- | :------------------------------ | :-------------------------------------------------------------------------- |
| `load_all_memos`    | `storage_path: String`                    | `Result<Vec<QuickMemoDto>, String>` | Scans storage directory, parsing all `.md` files into memory                |
| `save_memo_file`    | `storage_path: String, memo: QuickMemoDto`| `Result<(), String>`            | Atomically writes note to disk using temporary files to avoid corruption    |
| `delete_memo_file`  | `storage_path: String, memo_id: String`   | `Result<(), String>`            | Permanently removes the specified `YYYYMMDD.md` note file                   |
| `save_app_config`   | `config_path: String, config_json: String`| `Result<(), String>`            | Flushes configuration to `%USERPROFILE%\Documents\QuDaMemo\config.json` etc |
| `load_app_config`   | `config_path: String`                     | `Result<String, String>`        | Reads physical configuration JSON string from disk                          |

---

## 4. Data Structure Specifications

### 4.1 TypeScript Definitions (`src/types.ts`)

```typescript
export interface FrontmatterDto {
  title?: string;
  date: string; // "YYYY-MM-DD"
  weekday?: string; // "Mon", "Tue", "Wed"...
  holiday?: string; // Holiday label if applicable
  summary?: string; // AI generated summary
  tags?: string[];
  updated_at?: string; // "YYYY-MM-DD HH:mm:ss"
}

export interface QuickMemoDto {
  id: string; // "YYYYMMDD"
  date: string; // "YYYY-MM-DD"
  filename: string; // "YYYYMMDD.md"
  content: string; // Markdown body content
  rawMarkdown: string; // Raw note markdown including Frontmatter
  aiSummary: string; // AI summary text
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
  storagePath: string; // e.g., "%USERPROFILE%\\Documents\\QuDaMemo\\notes"
  configFilePath: string; // e.g., "%USERPROFILE%\\Documents\\QuDaMemo\\config.json"
  fileNameRule: string; // Default: "YYYYMMDD"
  summaryRule: string; // Prompt rule for AI summarization
  geminiModel: string; // Model identifier
  geminiApiKey: string; // Gemini API key
  geminiBaseUrl?: string; // Custom Base URL / Proxy endpoint
  activeSummaryMode?: 'api' | 'web_proxy' | 'local_fallback';
  lastTestResult?: LastTestResultData;
  autoSaveIntervalSeconds?: number; // Default: 10s
  customHolidays?: Record<string, string>; // "YYYY-MM-DD": "Holiday Name"
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

## 5. Logging & Rotation Specification

- **Log Target Path**: `[storagePath]/logs/qudamemo.log`
- **Rotation Threshold**: When the file exceeds 500KB, it automatically rotates into up to 3 archive generations (`qudamemo.log`, `qudamemo.log.1`, `qudamemo.log.2`).
- **Live Inspection**: Accessible in real-time through the `LogViewerModal` available from the TitleBar Help menu.
