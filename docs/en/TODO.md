# Task Management (TODO.md) - QuDaMemo

## Task Status

### Phase 1: Core Features & UI
- [x] Automatic Daily Memo Creation (`YYYYMMDD.md`)
- [x] Dynamic Frontmatter Templating (`{{date}}`, `{{weekday}}`)
- [x] Local & Same-Directory Configuration (`config.json`)
- [x] Gemini AI Summary Integration (`/api/summarize`)
- [x] Standardized Summary Prompt Rule Default
- [x] Gemini Model Selection Dropdown (`gemini-3.6-flash`, `gemini-3.6-pro`, etc.)

### Phase 2: Optimization & Porting Readiness
- [x] Throttle UI re-renders to 1Hz interval limit
- [x] Keep memory consumption under 100MB
- [ ] Core architecture for future Rust (egui/eframe) native porting
- [ ] Native system tray indicator IPC verification
