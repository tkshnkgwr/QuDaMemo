# Detailed AI Development Instructions (INSTRUCTIONS.md)

**English** | [日本語版](../ja/INSTRUCTIONS.md)

This document contains extended development and operational guidelines for AI Agents (Antigravity), expanded from `.agents/AGENTS.md`.

---

## 1. Response & Interaction Protocol
- **Conclusion First**: Present the solution or summary at the top before detailing context and changes.
- **Hyperlinks**: Use `[label](file:///absolute/path)` for exact file references.
- **Code Quality**: Ensure zero lint/build errors (`npm run lint`, `npm run build`, `cargo check`).

---

## 2. Documentation & Versioning Sync
- Synchronize documentation in `docs/en/` and `docs/ja/` whenever architectural, feature, or structural changes occur.
- **Versioning Protocol**: Automatically increment version numbers in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json` following Semantic Versioning (`MAJOR.MINOR.PATCH`) based on modification impact.
