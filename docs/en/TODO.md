# Task Management (TODO.md) - QuDaMemo

**English Version** | [日本語版](../ja/TODO.md)

## Task Status

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

### v1.1.3 Release (2026-10-27)

- [x] **Software License Migration (GPL-3.0-or-later)**:
  - Transitioned project license from MIT License to **GNU General Public License v3.0 or later (`GPL-3.0-or-later`)**.
  - Updated `LICENSE` to GPL v3 full text and synchronized license fields/badges in `package.json`, `Cargo.toml`, `README.md`, and `README_JA.md`.

### v1.1.2 Release (2026-10-27)

- [x] **Strict Environment Variable Usage for Documentation Paths (`Docs / Security`)**:
  - Unified all documentation paths (e.g., in `CHANGELOG.md`) to `%USERPROFILE%\Documents\QuDaMemo\config.json` adhering to RULES.md.
- [x] **README & Licensing Documentation Enhancement (`Docs`)**:
  - Restored comprehensive feature overviews, startup instructions, and clear links to the LICENSE file in `README.md` and `README_JA.md`.
- [x] **Workspace AI Rules & Skill Expansions (`Rules / Skills`)**:
  - Added fast CLI tool policies (`ripgrep` / `fd` / `jq`) to `RULES.md` and `GEMINI.md`.
  - Added new skill `vault-memo` for saving scratchpad ideas and technical notes into Obsidian Vault.

### v1.1.1 Release (2026-09-15)

- [x] **Unified Path Configurations with %USERPROFILE% Environment Variable (`Storage / Config`)**:
  - Replaced hardcoded paths with `%USERPROFILE%` variable for default note storage and config paths.
- [x] **Performance & Native Rust Optimization Roadmap (`Performance / Rust`)**:
  - Detailed Rayon multi-threaded scanning, native full-text search, `notify`-based hot reloading, and zip backup architectures.
- [x] **Standardized AI Agent Rules & Skill Definitions (`Rules / Skills`)**:
  - Completely set up RULES.md, GEMINI.md, AGENTS.md, and skill modules (`git-commit`, `markdown-table`, `tauri-verification`).
- [x] **Enhanced Cargo Dependency Reliability (`Build / Cargo`)**:
  - Updated `cc` crate in `Cargo.lock` to ensure solid compilation.

### Future Backlog

#### 🚀 Performance & Native Rust
- [ ] **Rayon Multi-threaded Parallel Note Loading & Fast Frontmatter Parsing (`load_all_memos`)**:
  - Parallelize scanning and parsing across CPU cores using `rayon` to cut cold-start load times by 5x-10x on large collections of daily notes.
- [ ] **Native Rust Full-Text Search & In-Memory Index (`search_memos_native`)**:
  - Offload client-side filtering to high-performance Rust parallel search (case-insensitive, multi-keyword AND/OR, tags, scoring) for zero-latency (<5ms) incremental search across 10,000+ notes.
- [ ] **`notify`-powered Native Directory Watcher (Incremental Hot Reload)**:
  - Non-blocking filesystem event monitoring using the `notify` crate. Directly captures note modifications/additions/deletions from external editors or cloud sync (OneDrive/Dropbox) without full rescans.
- [ ] **Precomputed Markdown Metadata & ToDo Task Completion Ratio via Rust**:
  - Leverage `pulldown-cmark` during initial load to precalculate task completion metrics (`- [ ]` vs `- [x]`) and headings, eliminating repetitive regex parsing in the frontend.
- [ ] **Native System Tray (`tauri::tray`) with Low-Memory Background Mode**:
  - Enable minimize-to-tray functionality maintaining a tiny background footprint of only a few megabytes.
- [ ] **Global Shortcut Instant Quick-Memo Popup (`tauri-plugin-global-shortcut`)**:
  - Summon the active day's memo window in under 0.05 seconds with a global hotkey (e.g., `Ctrl+Shift+M`) from any application.
- [ ] **Asynchronous Automated Backups & ZIP Archives in Native Rust**:
  - Asynchronously produce snapshots under `.qudamemo_backups/` on a background thread on every save, with optional zip compression to save disk space.
- [ ] **Virtual Scrolling & Chunked IPC Transfer**:
  - On-demand chunk streaming based on visible calendar months or scroll positions to drastically reduce initial DOM footprint and heap consumption.

#### 🔍 Search & Tags
- [ ] **Tag Filtering & Tag Cloud UI**: Fast tag selector dropdown to filter notes by existing tags.

#### 📝 Editor & Media Extensions
- [ ] **Image Drag & Drop Auto-Save**: Auto-save pasted/dropped images into `./assets/` and insert markdown image links.
- [ ] **External `.md` File Import**: Drag and drop external Markdown files to import or view.

#### 🛡️ Data Safety
- [ ] **Automated Note Backups**: Automatic snapshot creation under `.qudamemo_backups/` upon saving.

#### 🤖 AI & Local Integrations
- [ ] **Local AI (Ollama / Llama.cpp) Integration**: Fully offline local LLM summarization option.

#### 🛠️ Infrastructure & Robustness (Audit Findings & Backlog)
- [ ] **[High Priority] Runtime Environment Variable Expansion (`%USERPROFILE%` / `%APPDATA%` / `$HOME`) in Rust**:
  - Target Files: `src-tauri/src/lib.rs`, `src-tauri/src/commands.rs`
  - Issue: `DEFAULT_SETTINGS` specifies `%USERPROFILE%\Documents\QuDaMemo\...`, but Rust's `std::fs` and `Path::new` do not automatically expand Windows environment variables. On fresh installations, this risks creating literal `%USERPROFILE%` folders or path failures.
  - Solution: Implement a helper `resolve_path(raw_path: &str) -> PathBuf` to expand OS environment variables across all native IPC commands (`load_all_memos`, `save_memo_file`, `delete_memo_file`, `save_app_config`, `load_app_config`).
- [ ] **[Type Safety] Eliminate `any` in Settings & Enforce `LastTestResultData`**:
  - Target Files: `src/components/SettingsModal.tsx`, `src/components/settings/AiTab.tsx`
  - Issue: Connection test results are currently typed as `useState<any>` and `setTestResult: React.Dispatch<React.SetStateAction<any>>`.
  - Solution: Standardize state types to `LastTestResultData | null` defined in `src/types.ts`.
- [ ] **[Robustness] Enhanced YAML Frontmatter Parsing in Rust (Multiline & Escape Support)**:
  - Target Files: `src-tauri/src/lib.rs` (`parse_markdown_to_memo`)
  - Issue: Current line-based string matching (`starts_with`) may fail on multiline summaries or list-formatted tags (`- tag1\n- tag2`).
  - Solution: Upgrade to robust parsing compatible with `js-yaml` frontend behavior for multiline and escaped frontmatter fields.
- [ ] **[Reliability] Add Error Logging for Secondary Settings Backup**:
  - Target Files: `src/utils/fileStorage.ts` (`saveConfigFileToDisk`)
  - Issue: Failures while saving secondary mirrored backup to `notes/config.json` are silently caught with `.catch(() => {})`.
  - Solution: Add `logger.warn` to record backup issues in the in-app log viewer.
- [ ] **[Quality Assurance] Integrate Rust Tests (`cargo test`) into CI/CD Pipeline**:
  - Target Files: `.github/workflows/ci.yml`
  - Issue: The CI workflow currently runs `npm run lint` and `cargo check` but omits `cargo test`.
  - Solution: Add `cargo test --manifest-path src-tauri/Cargo.toml` to CI to guard against backend regressions on every push and PR.
