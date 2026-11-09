# Detailed Operational Instructions (INSTRUCTIONS.md) - QuDaMemo

**English Version** | [日本語版](../ja/INSTRUCTIONS.md)

---

## 1. AI Agent Operational Guidelines

This document complements [RULES.md](../../RULES.md) and [.agents/AGENTS.md](../../.agents/AGENTS.md), providing granular instructions for AI assistants ("Great Sage") working on this codebase.

### 1.1 Response Style & Principles

- **Honorific & Tone**: Always address the user as "Boss" (ボス) and respond with polite, professional, and prompt Japanese.
- **Conclusion First**: Present conclusions and answers immediately, organizing modifications, diffs, and logs into clear bullet points.
- **Hyperlink Rule**: When referencing files or symbols, use `[Label](file:///absolute/path)` format with forward slashes for Windows paths.
- **Plain Explanations**: Clarify technical concepts in accessible terms for users experienced with other programming languages (e.g. React Hooks as state lifecycle managers, Rust ownership as memory loan rules).

### 1.2 Fast CLI Tool Standards

- **Text & Code Searching**: Prioritize **`ripgrep` (`rg`)** or `git grep` over standard search tools.
- **Directory Traversal**: Prioritize **`fd`** over slower filesystem scanning tools.
- **JSON Processing**: Use **`jq`** for structured JSON extraction and transformations.

---

## 2. Quality Control & Workspace Skills

| Workflow Task          | Assigned Skill / Process                                                                        | Trigger & Conditions                                         |
| :--------------------- | :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **Code Pre-check**     | [tauri-verification skill](file:///.agents/skills/tauri-verification/SKILL.md)                  | When modifying `*.ts`, `*.tsx`, `*.rs`, or `Cargo.toml`      |
| **Doc Edits**          | Bypass pre-check for rapid documentation turnaround                                             | Pure Markdown edits (`*.md` only)                            |
| **Git Commit / Push**  | [git-commit skill](file:///.agents/skills/git-commit/SKILL.md)                                  | Explicit user chat instruction ONLY                          |
| **Markdown Tables**    | [markdown-table skill](file:///.agents/skills/markdown-table/SKILL.md)                          | Maintain strict vertical alignment of pipes and hyphens     |
| **Vault Memo Capture** | [vault-memo skill](file:///.agents/skills/vault-memo/SKILL.md)                                  | When user asks to capture thoughts into Obsidian Vault       |

---

## 3. Document Synchronization Matrix

Synchronize the following documents whenever relevant changes occur:

| Document           | Purpose & Domain                                                | Update Trigger                                              |
| :----------------- | :-------------------------------------------------------------- | :---------------------------------------------------------- |
| `CHANGELOG.md`     | Release notes & version changelog (JA/EN)                       | Completion of features, bug fixes, or optimizations         |
| `TODO.md`          | Task tracking and backlog items (JA/EN)                         | Task completion or new feature proposals                   |
| `SPECIFICATION.md` | Functional specifications & IPC interfaces (JA/EN)              | Layout changes, data model updates, new IPC commands        |
| `ARCHITECTURE.md`  | Layer boundaries, IPC bridge, persistence flows (JA/EN)         | Architectural, IPC, or storage flow modifications           |
| `DEVELOPMENT.md`   | Setup, directory structure, verification commands (JA/EN)       | Build scripts, dependency, or command updates               |
| `README.md`        | Overview, badges, quick start, license notices (JA/EN)          | Version updates, key features, or licensing changes         |

---

## 4. Semantic Versioning Standards

Version bumps must be synchronized across:
1. `package.json`
2. `src-tauri/Cargo.toml`
3. `src-tauri/tauri.conf.json` (auto-synced to `package.json`)
4. `docs/ja/CHANGELOG.md` and `docs/en/CHANGELOG.md`
