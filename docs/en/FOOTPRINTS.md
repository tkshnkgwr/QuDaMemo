# Resource Metrics (FOOTPRINTS.md) - QuDaMemo

Resource consumption performance metrics on low-spec systems:

## 1. Memory Usage
- **Express Backend**: ~35 MB
- **Vite/React UI**: ~45 MB
- **Total Combined**: **< 80 MB**

## 2. CPU & Rendering
- **Re-render Throttling**: Limited to 1Hz rendering interval. Idle CPU usage < 1%.
- **Future Rust Native Target**: RAM < 15MB, Startup time < 50ms.
