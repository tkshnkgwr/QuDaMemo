# Test Report (TEST_REPORT.md) - QuDaMemo

**English Version** | [日本語版](../ja/TEST_REPORT.md)

## Verification Date
2026-11-06 (v1.1.3)

## Test Execution Results

| Test Case              | Description                                          | Result   | Notes                                              |
| :--------------------- | :--------------------------------------------------- | :------- | :------------------------------------------------- |
| Static Type Check      | `npm run lint` (`tsc --noEmit`)                      | **PASS** | Zero type errors                                   |
| Frontend Unit Tests    | `npm run test` (Vitest: frontmatter / holidays)      | **PASS** | 2 test suites, 7 tests all passing                 |
| Rust Backend Tests     | `cargo test --manifest-path src-tauri/Cargo.toml`    | **PASS** | File I/O, frontmatter parse, config: 4 tests passed|
| Vite Production Build  | `npm run build`                                      | **PASS** | 1,967 modules transformed, bundles generated       |
| Tauri Rust Backend     | `cargo check --manifest-path src-tauri/Cargo.toml`   | **PASS** | Compiled without warnings or errors                |
| AI Model Persistence   | Select & save `geminiModel` and custom inputs        | **PASS** | Persisted to LocalStorage & config.json            |
| AI Summary Endpoint    | `gemini-3.7-flash` summarization and connection test | **PASS** | Fast response & successful generation              |
| Low-Resource Benchmark | RAM (< 80MB) & CPU load checks                       | **PASS** | No CPU spikes, stable idle (< 1% CPU)              |
| License Consistency    | GPL-3.0-or-later transition & configuration sync     | **PASS** | LICENSE, package.json, Cargo.toml, README aligned  |


