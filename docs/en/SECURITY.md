# Security Architecture (SECURITY.md) - QuDaMemo

**English Version** | [日本語版](../ja/SECURITY.md)

---

## 1. API Key Confidentiality & Local-Only Storage

- **Strict Local Isolation**: Gemini API keys configured by the user are preserved exclusively on the local machine within the physical configuration file (`%USERPROFILE%\Documents\QuDaMemo\config.json`) and temporary process memory.
- **Zero Telemetry & Tracking**: The codebase contains zero analytics, usage tracking, or third-party tracking scripts.
- **Direct Encrypted Transport (HTTPS)**: AI requests are transmitted directly and securely (TLS/HTTPS) to Google's official Gemini API endpoints or a custom reverse proxy explicitly designated by the user.

---

## 2. Local File System Sandboxing & Protection

- **Tauri v2 Capabilities Policies**:
  - `src-tauri/capabilities/default.json` enforces least-privilege policies, explicitly restricting filesystem scopes and window operations.
- **Path Resolution & Traversal Prevention**:
  - File reading and writing operations are strictly confined to the user-designated `storagePath` (e.g. `%USERPROFILE%\Documents\QuDaMemo\notes`) and configuration file locations.
  - Path traversal attempts (`../`) are systematically blocked by the Rust native backend.
- **Atomic File Writing**:
  - Memo saves utilize an atomic write strategy: writing to a temporary file and atomically renaming upon full disk sync. This prevents data corruption from power loss or abrupt application termination.

---

## 3. Open Source Transparency (GPL-3.0-or-later)

QuDaMemo is licensed under the **GNU General Public License v3.0 or later (GPL-3.0-or-later)**.
With completely open source code, all operations, privacy safeguards, and security practices can be independently audited, compiled, and verified by the community.
