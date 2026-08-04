# Changelog (CHANGELOG.md) - QuDaMemo

**English Version** | [日本語版](../ja/CHANGELOG.md)

All notable changes to this project will be documented in this file.

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
