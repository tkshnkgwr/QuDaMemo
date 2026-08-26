# Resource Metrics (FOOTPRINTS.md) - QuDaMemo

**English Version** | [日本語版](../ja/FOOTPRINTS.md)

Resource consumption performance metrics on low-spec Windows environments:

## 1. Memory Footprint (RAM Usage)

- **Tauri v2 Rust Backend**: ~10–15 MB
- **WebView2 Frontend (React 19 / Vite)**: ~45–65 MB
- **Total Combined**: **< 80 MB (at idle)**

## 2. CPU & Rendering

- **Update Throttling**: Background/idle polling throttled to 1Hz. Idle CPU usage < 1%.
- **Release Profile Optimization**: Minimized binary size and runtime overhead via `opt-level = 'z'`, `lto = true`, `codegen-units = 1`, and `strip = true`.


