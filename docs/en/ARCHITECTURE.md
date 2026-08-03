# Architecture (ARCHITECTURE.md) - QuDaMemo

**English** | [日本語版](../ja/ARCHITECTURE.md)

QuDaMemo utilizes a decoupled architecture combining **Vite + React 19** frontend and **Tauri v2 Rust** native backend.

- **Frontend**: Lightweight React UI components for note management and frontmatter handling.
- **Backend (src-tauri)**: Window management (frameless, transparent), native OS interactions.
