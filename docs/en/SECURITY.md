# Security Architecture (SECURITY.md) - QuDaMemo

**English Version** | [日本語版](../ja/SECURITY.md)

## 1. API Key Protection & Confidentiality

- User Gemini API keys are strictly maintained within the local configuration file (`config.json`) and in-memory state.
- Keys are never collected, logged, or forwarded to external third parties or telemetry endpoints.
- AI requests are encrypted (HTTPS) and sent directly to Google Gemini official endpoints (or the user-configured custom proxy URL).

## 2. Local File Isolation

- Tauri v2 capability ACLs and Rust backend path validation ensure file read/write operations are confined to the user-selected `storagePath` and application configuration file.
- Arbitrary file manipulation and path traversal vulnerabilities are strictly prevented.


