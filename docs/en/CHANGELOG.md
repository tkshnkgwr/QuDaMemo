# Changelog (CHANGELOG.md) - QuDaMemo

**English Version** | [日本語版](../ja/CHANGELOG.md)

All notable changes to this project will be documented in this file.

## [1.0.3] - 2026-08-05

### Added & Improved
- **QuMaEditor-Compliant List-Style Theme Dropdown Menu**:
  - Replaced theme toggle button with a list dropdown menu (Light / Dark / System) with active checkmark indicators.
- **QuMaEditor-Compliant List-Style Help Dropdown Menu**:
  - Replaced Help button with a dropdown menu listing "Keyboard Shortcuts (F1)", "View App Logs", and "About QuDaMemo (v1.0.3)".
- **Application Log Viewer Modal (`LogViewerModal`)**:
  - Added full log viewer modal allowing real-time inspection, copying, refreshing, and clearing of `qudamemo.log`.
- **About App Modal (`AboutModal`)**:
  - Added About dialog displaying dynamic app version (`v1.0.3`), tech stack details, and credits.

---

## [1.0.2] - 2026-08-05

### Added & Improved
- **Prevent Multiple Instances (Single Instance)**:
  - Integrated `tauri-plugin-single-instance` to prevent duplicate app launches. Re-opening focuses the existing window.
- **Auto Memory & Restoration of Window Position/Size**:
  - Integrated `tauri-plugin-window-state` to automatically remember and restore last window bounds (X, Y, Width, Height, Maximized state).
- **Streamlined TitleBar UI with Dynamic Versioning**:
  - Dynamically displays app version from `package.json` (`v1.0.2`).
  - Removed "Rust Engine" badge, storage path indicator, and Pos text for a clean UI.
  - Added Help button (HelpCircle) based on QuMaEditor specs (opens keyboard shortcuts modal).
- **Fixed SettingsModal Tab Switching Jitter**:
  - Fixed modal height to `h-[580px]` to eliminate layout shifts when switching tabs.

---

## [1.0.1] - 2026-08-05

### Fixed
- **Root Fix for Physical `.md` File Saving Error**:
  - Added `#[serde(default)]` and `Option` to Rust `FrontmatterDto` fields (such as `title`) to fix JSON deserialization type mismatch when invoking Rust save commands.
  - Expanded `fs` permissions in `capabilities/default.json` to allow full filesystem write/read capabilities to user-configured directories.
  - Passed `settings` context to `getOrCreateMemoForDate` to ensure new memos are saved to physical disk immediately.
- **LocalStorage Cache Management & Overflow Protection**:
  - Implemented automatic trimming of LocalStorage cache to a maximum of 365 items to prevent browser storage bloat.
  - Added physical storage path display for LocalStorage (`%LOCALAPPDATA%\...`) in Settings > Other.
  - Added a "Clear LocalStorage Cache" button (safely retaining all physical `.md` files on disk).

---

## [1.0.0] - 2026-08-04

### Changed
- **Official v1.0.0 Stable Release**:
  - First stable release with RustDoc, TypeDoc, Specta auto type bindings, Vitest/Cargo unit tests, and AI-managed versioning protocol fully integrated.
  - AI-managed versioning (Semantic Versioning) officially activated.
  - Documented strict rule: skip all compile/lint commands for documentation-only changes.

---

## [0.2.0] - 2026-08-04

### Added
- **Automated Type Binding via Specta (`tauri-specta`)**:
  - Automatically exports Rust DTOs and command signatures to TypeScript definitions (`src/bindings.ts`).
- **RustDoc & TypeDoc Documentation Generation**:
  - Comprehensive RustDoc comments and `cargo doc` integration.
  - TypeDoc setup with `npm run doc` generating HTML documentation in `docs/typedoc/`.
- **Automated Unit Testing Suite (Cargo Test & Vitest)**:
  - Rust unit tests (`cargo test`) verifying parsing, parallel reading, atomic saving, and deletion.
  - TypeScript unit tests (`npm run test`) validating Frontmatter syntax parsing, building, and Japanese holiday/weekday logic.
- **AI-Managed Versioning Protocol**:
  - Established Semantic Versioning guidelines in `.agents/AGENTS.md` and related documentation.

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
