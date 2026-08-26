# Testing Strategy (TESTING.md) - QuDaMemo

**English Version** | [日本語版](../ja/TESTING.md)

## 1. Principles

- **Static Analysis**: TypeScript type checking (`npm run lint`) for syntax and type safety.
- **Unit Testing**: Vitest (`npm run test`) for frontmatter parsing and Japanese holiday logic coverage.
- **Build Verification**: Vite frontend compilation (`npm run build`) and Tauri Rust backend checking (`cargo check`).
- **Performance Benchmarking**: Low-resource idle CPU and memory consumption measurements.

## 2. Verification Commands
```bash
# 1. TypeScript type check
npm run lint

# 2. Run unit tests (Vitest)
npm run test

# 3. Vite frontend build
npm run build

# 4. Tauri Rust backend check
cargo check --manifest-path src-tauri/Cargo.toml
```

