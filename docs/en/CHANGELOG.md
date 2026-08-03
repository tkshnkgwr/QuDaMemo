# Changelog (CHANGELOG.md) - QuDaMemo

**English Version** | [日本語版](../ja/CHANGELOG.md)

All notable changes to this project will be documented in this file.

---

## [0.1.1] - 2026-08-03

### Added
- **CORS Bypass via Tauri Native HTTP Plugin (`@tauri-apps/plugin-http`)**:
  - Direct HTTP communication module bypassing browser CORS restrictions for custom Base URLs and relay proxies.
- **Dual AI Connection Testing & Persistent Test Results**:
  - Parallel testing for API summarization and Web/URL endpoint accessibility with response latency metrics and timestamp persistent storage.
- **2-Column Category Settings Modal (SettingsModal)**:
  - Redesigned 2-column tabbed layout (📂General, 🤖AI & Summary, 🎨Theme, 📦Backup).
  - Added green pulsing indicator for active API key status.
- **Customizable Auto-Save Delay (Default: 10s, 0 Disallowed)**:
  - Configurable auto-save delay timer from Settings. Guaranteed minimum 1 second.
  - Fixed premature "Saving..." status glitch during active typing.
- **Zero-Wait Navigation & Asynchronous Background AI Summarization**:
  - Instant return to list view on "Close & Back to List" without blocking. Asynchronous AI summarization executes in the background and auto-saves Markdown files upon completion.
- **Prioritized Storage Folder Picker**:
  - Folder picker dialog opens directly to the currently configured path instead of the previously opened directory.
- **Physical Storage Path Auto-Correction & Log Rotation System**:
  - Corrected default storage path to user's real Documents folder `C:\Users\<user>\Documents\QuDaMemo\notes`.
  - Automatic log rotation (up to 3 generations: `qudamemo.log`, `qudamemo.log.1`, `qudamemo.log.2` at 500KB threshold) in `[storagePath]/logs/`.

---

## [0.1.0] - 2026-08-03

### Added
- **Tauri v2 Desktop App Transformation**:
  - Native frameless, transparent UI desktop window framework.
  - `@tauri-apps/plugin-dialog` integration for file saving and directory picking.
- **Standardized AI Model**: Default model set to `Google Gemini 3.6 Flash` (`gemini-3.6-flash`).
