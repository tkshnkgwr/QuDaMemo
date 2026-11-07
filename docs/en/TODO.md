# Task Management (TODO.md) - QuDaMemo

**English Version** | [日本語版](../ja/TODO.md)

---

## 📌 Task Status

### Phase 1: Core Features & UI

- [x] Automatic Daily Memo Creation (`YYYYMMDD.md`)
- [x] Dynamic Frontmatter Templating (`{{date}}`, `{{weekday}}`, etc.)
- [x] Local & Same-Directory Configuration (`config.json`) with native Rust persistence
- [x] Gemini AI Summary Integration
- [x] Standardized Summary Prompt Rule Default
- [x] Gemini Model Selection Dropdown (Presets including `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-2.5-pro` & custom model manual input)
- [x] AI Model Selection Guidelines (Speed vs. Quality comparison)
- [x] Calendar Holiday externalization & custom holiday management
- [x] Dynamic tooltip position tracking in weekly calendar (`e.clientX`, `e.clientY`)
- [x] Default search date range set to current month (1st to end of month)
- [x] LocalStorage cache clearing with explicit note safety assurance
- [x] Independent App Overview & Usage Guide modal (`AppOverviewModal`)
- [x] Preserved view state upon closing editor (returns accurately to monthly/weekly calendar or list)
- [x] Automated `updated_at` recording in YAML frontmatter
- [x] Full Dark Mode scrollbar support (`color-scheme: dark`)

### Phase 2: Low-Resource & Native Optimization

- [x] Throttle UI re-renders to 1Hz interval limit
- [x] Keep memory consumption under 80MB
- [x] Tauri v2 packaging and production build verification
- [ ] Native system tray indicator IPC verification

### v1.1.1 Release (2026-09-15)

- [x] **Unified Path Configurations with %USERPROFILE% Environment Variable (`Storage / Config`)**:
  - Replaced hardcoded paths with `%USERPROFILE%` variable for default note storage (`%USERPROFILE%\Documents\QuDaMemo\notes`) and config paths (`%USERPROFILE%\Documents\QuDaMemo\config.json`).
- [x] **Performance & Native Rust Optimization Roadmap (`Performance / Rust`)**:
  - Detailed Rayon multi-threaded scanning, native full-text search, `notify`-based hot reloading, and zip backup architectures.
- [x] **Standardized AI Agent Rules & Skill Definitions (`Rules / Skills`)**:
  - Completely set up RULES.md, GEMINI.md, AGENTS.md, and skill modules (`git-commit`, `markdown-table`, `tauri-verification`).
- [x] **Enhanced Cargo Dependency Reliability (`Build / Cargo`)**:
  - Updated `cc` crate in `Cargo.lock` to ensure solid compilation across all platforms.

### v1.1.2 Release (2026-10-27)

- [x] **Complete Path Variable Harmonization in Documentation (`Docs / Security`)**:
  - Unified configuration file and note directory paths across all documentation to `%USERPROFILE%\Documents\QuDaMemo\config.json`, adhering strictly to RULES.md environment variable standards.
- [x] **README Documentation & License Synchronization (`Docs / Readme`)**:
  - Restored Key Features and Quick Start workflows in README files, updating the license notice with an explicit reference to the LICENSE file.
- [x] **Enhanced Workspace Rules & Skills (`Rules / Skills`)**:
  - Added fast CLI tool principles (`ripgrep` / `fd` / `jq`) to `RULES.md` and `GEMINI.md`.
  - Added new `vault-memo` skill for automated fleeting note capture into Obsidian Vault.

### v1.1.3 Release (2026-10-27)

- [x] **Software License Transition to GPL-3.0-or-later (`License / Legal`)**:
  - Migrated project license from MIT License to **GNU General Public License v3.0 or later (`GPL-3.0-or-later`)**.
  - Updated `LICENSE` text to GPL v3, and synchronized license metadata and status badges across `package.json`, `Cargo.toml`, `README.md`, and `README_JA.md`.

---

## 🛠️ Required Fixes & Code Cleanup (Fixes & Code Cleanup)

### 1. 🐛 Logic Bugs & Argument Mismatches

- [ ] **Fix Inverted Arguments in Settings Export (`src/components/settings/BackupTab.tsx`)**:
  - In `BackupTab.tsx` line 20, `exportFileWithDialog(jsonStr, 'qudamemo_config.json', 'JSON (*.json)')` has inverted arguments (passing huge JSON content into the filename parameter). Correct to `exportFileWithDialog('qudamemo_config.json', jsonStr, 'application/json')`.
- [ ] **Harmonize Placeholder Path with Environment Variable (`src/components/settings/GeneralTab.tsx`)**:
  - Replace the raw local path `placeholder="C:\Users\..."` in the storage directory input with `%USERPROFILE%\Documents\QuDaMemo\notes` in strict compliance with RULES.md.

### 2. ⌨️ Complete Unimplemented Keyboard Shortcuts

- [ ] **Implement Editor Shortcut Listeners (`src/components/MemoEditor.tsx`)**:
  - Implement active keydown handlers in `MemoEditor.tsx` for shortcuts documented in the UI and guides:
    - `Ctrl + S`: Trigger immediate manual atomic memo save.
    - `Ctrl + E`: Toggle between editor and preview modes.
    - `Ctrl + Enter`: Trigger on-demand AI summarization with active settings.
- [ ] **Implement Global Search Focus Shortcut (`Ctrl + F`) (`src/App.tsx` / `SearchHeader.tsx`)**:
  - Wire a global keyboard event listener so that hitting `Ctrl + F` instantly shifts focus to the search query input bar.

### 3. 📦 Clean Up Unused Crates & Dependencies

- [ ] **Prune Unused Rust Crates (`src-tauri/Cargo.toml`)**:
  - `tauri-specta` / `specta-typescript`: Either implement the TypeScript export generation pipeline or remove these dependencies from `Cargo.toml`.
  - `log = "0.4"`: Unused across the Rust codebase; either wire native logging macros or remove.
- [ ] **Remove Unused Frontend Dependencies (`package.json`)**:
  - `dotenv`: Never imported in source code; prune from dependencies.
  - `motion`: Fully superseded by TailwindCSS animations and never imported; prune from dependencies.

### 4. 🧩 Prune Unused Components, Icons & Settings

- [ ] **Remove Unused Icons & Duplicate Imports (`SearchHeader.tsx`, `MemoList.tsx`)**:
  - `SearchHeader.tsx`: Prune unused `HelpCircle` and `Keyboard` icons, and deduplicate `Calendar` imports.
  - `MemoList.tsx`: Remove unused `Lock` icon import.
- [ ] **Clean Up Dead Settings Properties (`src/types.ts`, `src/utils/storage.ts`)**:
  - `googleDriveEnabled: boolean;`: Dead property present only in types and defaults without implementation; prune or relegate to backlog.
  - `windowBounds.x`, `y`: Window restoration is handled natively by `tauri-plugin-window-state`; streamline unnecessary state tracking.

### 5. 🛡️ Align Backend Storage Implementation with Specifications

- [ ] **True Atomic Rename Memo Storage (`src-tauri/src/lib.rs`)**:
  - Refactor `save_memo_file_impl` from direct `fs::write` to writing to a temporary file before performing an atomic rename, matching architectural documentation.
- [ ] **Refactor Empty Setup Closure (`src-tauri/src/lib.rs`)**:
  - Clean up `.setup(|_app| Ok(()))` or properly initialize directory/logging structures.

---

## 🚀 Feature Backlog & Future Improvements

### 1. 🪟 Desktop & UI Experience Innovations

- [ ] **Always-on-Top Floating Mini-Widget (Sticky Task Mode)**:
  - An ultra-lightweight, frameless, transparent sticky note window on screen edges displaying only today's checklist items (`- [ ]`). Toggle and append tasks with single-click convenience.
- [ ] **Global Shortcut Instant Quick-Memo Popup (`tauri-plugin-global-shortcut`)**:
  - Summon the active day's memo window in under 0.05 seconds with a global hotkey (e.g., `Ctrl+Shift+M`) from any application.
- [ ] **Native System Tray (`tauri::tray`) with Low-Memory Background Mode**:
  - Enable minimize-to-tray functionality maintaining a tiny background footprint of only a few megabytes.
- [ ] **Obsidian Bi-directional Wiki Links (`[[YYYYMMDD]]`, `[[Note Title]]`) Parsing & Preview Jump**:
  - Detect and parse `[[20261108]]` or `[[Keyword]]` in memo content into clickable links. Click to jump to the note, or hover to preview Frontmatter/Summary in a popover.
- [ ] **Time Capsule ("On this day in the past" / "Last week today") Recommendations**:
  - Present quick links and summaries of memos from 1 year ago, 1 month ago, or 1 week ago at the bottom of the editor to encourage effortless daily reflection.

### 2. ⚡ Performance & Native Rust Optimization

- [ ] **Rayon Multi-threaded Parallel Note Loading & Fast Frontmatter Parsing (`load_all_memos`)**:
  - Parallelize scanning and parsing across CPU cores using `rayon` to cut cold-start load times by 5x-10x on large collections of daily notes.
- [ ] **Native Rust Full-Text Search & In-Memory Index (`search_memos_native`)**:
  - Offload client-side filtering to high-performance Rust parallel search (case-insensitive, multi-keyword AND/OR, tags, scoring) for zero-latency (<5ms) incremental search across 10,000+ notes.
- [ ] **`notify`-powered Native Directory Watcher (Incremental Hot Reload)**:
  - Non-blocking filesystem event monitoring using the `notify` crate. Directly captures note modifications/additions/deletions from external editors or cloud sync (OneDrive/Dropbox) without full rescans.
- [ ] **Precomputed Markdown Metadata & ToDo Task Completion Ratio via Rust**:
  - Leverage `pulldown-cmark` during initial load to precalculate task completion metrics (`- [ ]` vs `- [x]`) and headings, eliminating repetitive regex parsing in the frontend.
- [ ] **Virtual Scrolling & Chunked IPC Transfer**:
  - On-demand chunk streaming based on visible calendar months or scroll positions to drastically reduce initial DOM footprint and heap consumption.

### 3. 📝 Editor & Smart Templating

- [ ] **Day-of-Week & Weekday/Holiday Smart Template Branching**:
  - Automatically switch initial Frontmatter and markdown body templates depending on weekday vs. weekend/holiday (e.g., weekly goal setup on Mondays, retrospectives on Fridays, hobby logs on weekends).
- [ ] **Native Markdown Table Auto-Formatter (Strict Vertical Alignment)**:
  - Built-in formatter to automatically align pipes and hyphens with character-width padding on save or shortcut, maintaining gVim-grade readability.
- [ ] **Image Drag & Drop Auto-Save**:
  - Auto-save pasted/dropped images into `./assets/` and insert markdown image links `![image](./assets/...)`.
- [ ] **External `.md` File Import Support**:
  - Drag and drop external Markdown files to import or view immediately.

### 4. 🤖 AI & Advanced Summarization

- [ ] **Context-Aware Selection AI Summarization & Polish Menu**:
  - Inline AI assistant to summarize, rephrase, bulletize, or extract action items directly from highlighted text blocks in the editor.
- [ ] **Local AI (Ollama / Llama.cpp) Integration**:
  - Fully offline local LLM summarization option for air-gapped or confidential environments.
- [ ] **Streaming AI Summary Output**:
  - Real-time token streaming UI during long summary generation.

### 5. 🛡️ Data Safety, Export & Backup

- [ ] **Batch Range Export (Consolidated Markdown / HTML / Print Preview)**:
  - Export monthly or custom date range notes into a single unified Markdown file or formatted HTML suitable for printing and archiving.
- [ ] **Asynchronous Automated Backups & ZIP Archives in Native Rust**:
  - Asynchronously produce snapshots under `.qudamemo_backups/` on a background thread on every save, with optional zip compression to save disk space.
