# Resource Profiling (FOOTPRINTS.md) - QuDaMemo

**English Version** | [日本語版](../ja/FOOTPRINTS.md)

---

## 1. Benchmark Environment

Empirical resource measurements recorded in a low-spec PC environment (energy-efficient Windows laptop):

| Environment Metric   | Specifications / Parameters                                    |
| :------------------- | :------------------------------------------------------------- |
| **Operating System** | Windows 11 Home 64-bit                                         |
| **System RAM**       | 8.0 GB                                                         |
| **Processor**        | 4-Core / 8-Thread Energy-Efficient Mobile CPU                  |
| **Frontend Runtime** | Evergreen WebView2 (React 19 / Vite)                           |
| **Backend Core**     | Tauri v2 (Rust 1.80+) Optimized Release Build                  |

---

## 2. Memory Footprint (RAM Usage)

| Process Component        | Idle Memory Footprint | Active Editing RAM   | Notes                                           |
| :----------------------- | :-------------------- | :------------------- | :---------------------------------------------- |
| **Tauri Rust Core**      | ~10 - 15 MB           | ~15 - 20 MB          | Compact native binary footprint                 |
| **WebView2 Frontend UI** | ~45 - 65 MB           | ~60 - 75 MB          | React 19 virtual DOM & layout cache             |
| **Total System RAM**     | **~55 - 80 MB**       | **85 - 95 MB**       | **Consistently stays below 100 MB**             |

---

## 3. CPU Load & Rendering Optimizations

- **1Hz Re-render Throttle**: Background timers, clocks, and polling intervals are capped to 1Hz, maintaining idle CPU usage strictly **under 1%**.
- **Aggressive Release Profile (`Cargo.toml`)**:
  - `opt-level = 'z'`: Minimizes binary size.
  - `lto = true`: Cross-crate Link-Time Optimization.
  - `codegen-units = 1`: Single compilation unit maximizes compiler inlining.
  - `panic = 'abort'`: Strips unwinding tables to reduce memory overhead.
  - `strip = true`: Removes all symbol debug info from executable.
