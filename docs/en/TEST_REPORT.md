# Test Execution Report (TEST_REPORT.md) - QuDaMemo

**English Version** | [日本語版](../ja/TEST_REPORT.md)

---

## Verification Date & Environment
- **Version Tested**: v1.1.3
- **Verification Date**: 2026-11-06
- **Test Environment**: Windows 11 (x64) / Node.js v18+ / Rust v1.80+ / WebView2

## Test Environment & Scope
- **Target Version**: v1.1.3
- **Environment**: Windows 11 (x64) / Node.js v18+ / Rust v1.80+ / WebView2

---

## Test Results Summary

| Test Case              | Description                                           | Result   | Notes                                               |
| :--------------------- | :---------------------------------------------------- | :------- | :-------------------------------------------------- |
| Static Type Check      | `npm run lint` (`tsc --noEmit`)                       | **PASS** | Zero type errors                                    |
| Frontend Unit Tests    | `npm run test` (Vitest: frontmatter / holidays)       | **PASS** | 2 test suites, 7 tests all passing                  |
| Rust Backend Tests     | `cargo test --manifest-path src-tauri/Cargo.toml`     | **PASS** | File I/O, frontmatter parse, config: 4 tests passed |
| Vite Production Build  | `npm run build`                                       | **PASS** | 1,967 modules transformed, bundles generated        |
| Tauri Rust Backend     | `cargo check --manifest-path src-tauri/Cargo.toml`    | **PASS** | Compiled without warnings or errors                 |
| Config File Store      | Dual persistence via physical `config.json` & mirror  | **PASS** | Guaranteed recovery after browser cache clear       |
| AI Model Persistence   | Select & save `geminiModel` and custom inputs         | **PASS** | Persisted to LocalStorage & config.json             |
| AI Summary Endpoint    | `gemini-3.7-flash` summarization and connection test  | **PASS** | Fast response & successful generation               |
| Low-Resource Benchmark | RAM (< 80MB) & CPU load checks                        | **PASS** | No CPU spikes, stable idle (< 1% CPU)               |
| License Consistency    | GPL-3.0-or-later transition & configuration sync      | **PASS** | LICENSE, package.json, Cargo.toml, README aligned   |

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
