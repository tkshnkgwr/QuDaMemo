# Test Execution Report (TEST_REPORT.md) - QuDaMemo

**English Version** | [日本語版](../ja/TEST_REPORT.md)

---

## Verification Date & Environment
- **Version Tested**: v1.1.4
- **Verification Date**: 2026-11-20
- **Test Environment**: Windows 11 (x64) / Node.js v26.4.0 / Rust 1.100.0 / WebView2

---

## Test Results Summary

| Test Case              | Description                                           | Result   | Notes                                                              |
| :--------------------- | :---------------------------------------------------- | :------- | :----------------------------------------------------------------- |
| Static Type Check      | `npm run lint` (`tsc --noEmit`)                       | **PASS** | Zero type errors                                                   |
| Frontend Unit Tests    | `npm run test` (Vitest: frontmatter / holidays)       | **PASS** | 2 test suites, 7 tests all passing                                 |
| Rust Backend Tests     | `cargo test --manifest-path src-tauri/Cargo.toml`     | **PASS** | Parsing, atomic I/O, traversal guard & env expansion: 7 passed     |
| Rust Lint & Format     | `cargo clippy --all-targets -- -D warnings` / `fmt`   | **PASS** | Zero warnings, formatting clean                                    |
| Vite Production Build  | `npm run build`                                       | **PASS** | 1,967 modules transformed, bundles generated                       |
| Config File Store      | Dual persistence via physical `config.json` & mirror  | **PASS** | Guaranteed recovery after browser cache clear                      |
| AI Model Persistence   | Select & save `geminiModel` and custom inputs         | **PASS** | Persisted to LocalStorage & config.json                            |
| AI Summary Endpoint    | `gemini-3.7-flash` summarization and connection test  | **PASS** | Fast response & successful generation                              |
| Low-Resource Benchmark | RAM (< 80MB) & CPU load checks                        | **PASS** | No CPU spikes, stable idle (< 1% CPU)                              |
| License Consistency    | GPL-3.0-or-later transition & configuration sync      | **PASS** | LICENSE, package.json, Cargo.toml, README aligned                  |
