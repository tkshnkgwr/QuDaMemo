# Detailed AI Development Instructions (INSTRUCTIONS.md)

**English Version** | [日本語版](../ja/INSTRUCTIONS.md)

This document contains extended development and operational guidelines for AI Agents (Antigravity), expanded from `.agents/AGENTS.md`.

---

## 1. Response & Interaction Protocol

- **Conclusion First**: Present the solution or summary at the top before detailing context and changes.
- **Hyperlinks**: Use `[label](file:///absolute/path)` format for exact file and symbol references.
- **Conceptual Explanations**: Explain framework-specific concepts (e.g. React hooks, Rust ownership) using general programming paradigms.

---

## 2. Quality Control & Verification Procedures

- **Code Quality Checks**:
  - Run checks whenever source code (`*.ts`, `*.tsx`, `*.rs`, `Cargo.toml`, etc.) is modified:
  - `npm run lint`: Confirm zero TypeScript type errors.
  - `npm run test`: Confirm all unit tests pass.
  - `npm run build`: Confirm Vite frontend bundle succeeds.
  - `cargo check --manifest-path src-tauri/Cargo.toml`: Confirm Tauri Rust backend passes.
- **Module Splitting (1,000-line Rule)**: Proactively propose modularization when any single source file exceeds 1,000 lines.

---

## 3. Documentation Auto-Sync Rules

- Synchronize the following documents whenever relevant changes occur:

| Document           | Purpose        | Sync Trigger                                   |
| :----------------- | :------------- | :--------------------------------------------- |
| `CHANGELOG.md`     | Change Log     | Features added, bugs fixed, or removed         |
| `SPECIFICATION.md` | Specifications | UI layout, data structures, shortcuts changed  |
| `ARCHITECTURE.md`  | Architecture   | System boundaries, IPC bridge, process changed |
| `DEVELOPMENT.md`   | Dev Guide      | Build steps, dependencies, commands changed    |

---

## 4. Version Management Protocol (Semantic Versioning)

- Maintain synchronized versioning across `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`:
  - **MAJOR (x.0.0)**: Breaking changes / major architectural redesign
  - **MINOR (0.x.0)**: New features / major libraries or model support
  - **PATCH (0.0.x)**: Bug fixes / minor enhancements


