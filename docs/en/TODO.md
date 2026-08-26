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
- [ ] **Native Rust Parallel Search (`search_memos_ipc`)**: Delegate keyword & tag search to multi-threaded `rayon` Rust backend for instant searching over 10,000+ notes.
- [ ] **Native System Tray**: Ultra-lightweight system tray menu using Tauri v2 native API.

#### 🔍 Search & Tags
- [ ] **Tag Filtering & Tag Cloud UI**: Fast tag selector dropdown to filter notes by existing tags.

#### 📝 Editor & Media Extensions
- [ ] **Image Drag & Drop Auto-Save**: Auto-save pasted/dropped images into `./assets/` and insert markdown image links.
- [ ] **External `.md` File Import**: Drag and drop external Markdown files to import or view.

#### 🛡️ Data Safety
- [ ] **Automated Note Backups**: Automatic snapshot creation under `.qudamemo_backups/` upon saving.

#### 🤖 AI & Local Integrations
- [ ] **Local AI (Ollama / Llama.cpp) Integration**: Fully offline local LLM summarization option.
