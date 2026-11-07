# Test Execution Report (TEST_REPORT.md) - QuDaMemo

**English Version** | [日本語版](../ja/TEST_REPORT.md)

---

## Test Environment & Scope
- **Target Version**: v1.1.3
- **Environment**: Windows 11 (x64) / Node.js v18+ / Rust v1.80+ / WebView2

---

## Test Results Summary

| Test Scope                 | Details & Verification Command                        | Status   | Notes                                           |
| :------------------------- | :---------------------------------------------------- | :------- | :---------------------------------------------- |
| TypeScript Static Analysis | `npm run lint` (`tsc --noEmit`)                       | **PASS** | 0 type errors                                   |
| Frontend Unit Tests        | `npm run test` (Vitest: frontmatter / holidays)       | **PASS** | All test suites passing                         |
| Vite Production Build      | `npm run build`                                       | **PASS** | Bundle generated without errors                 |
| Tauri Rust Backend Check   | `cargo check --manifest-path src-tauri/Cargo.toml`    | **PASS** | Clean build without warnings                    |
| Rust Native Unit Tests     | `cargo test --manifest-path src-tauri/Cargo.toml`     | **PASS** | Parsing, atomic I/O & persistence tests passing |
| Config Persistence Safety  | Physical `config.json` and dual directory backup      | **PASS** | Settings and API keys preserved across resets   |
| AI Model Selection & Input | Model preset switching & custom manual input in UI    | **PASS** | Synchronized cleanly with LocalStorage & config |
| Gemini AI Integration      | Summary generation with `gemini-3.7-flash`            | **PASS** | High-speed response, accurate summary format    |
| Resource Footprint Check   | Memory footprint (<80MB) & 1Hz render throttle        | **PASS** | No CPU spikes, stable idle memory usage         |
