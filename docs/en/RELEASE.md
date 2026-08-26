# Release Guide (RELEASE.md) - QuDaMemo

**English Version** | [日本語版](../ja/RELEASE.md)

## 1. Quality Validation Process
```bash
# 1. TypeScript type check
npm run lint

# 2. Run unit tests
npm run test

# 3. Vite frontend build
npm run build

# 4. Tauri Rust backend check
cargo check --manifest-path src-tauri/Cargo.toml
```

## 2. Production Build
```bash
# Build native Windows executable / installer (.exe / .msi)
npx tauri build
```
Build artifacts are placed in `src-tauri/target/release/` and `src-tauri/target/release/bundle/msi/`.

## 3. Version Bump Flow (Semantic Versioning)

When releasing a new version, synchronize the following files:

1. `"version"` in `package.json`
2. `version` in `src-tauri/Cargo.toml`
3. Add release notes in `docs/ja/CHANGELOG.md` and `docs/en/CHANGELOG.md`
4. Update version badge and features in `README.md` and `README_JA.md` if necessary

