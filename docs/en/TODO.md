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
