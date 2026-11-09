# Release Workflow (RELEASE.md) - QuDaMemo

**English Version** | [日本語版](../ja/RELEASE.md)

---

## 1. Pre-Release Verification Checklist

Execute the complete verification suite and ensure all checks PASS before cutting a release:

```bash
# 1. TypeScript static type check (0 errors required)
npm run lint

# 2. Frontend unit tests (Vitest)
npm run test

# 3. Production Vite build
npm run build

# 4. Tauri Rust backend syntax check
cargo check --manifest-path src-tauri/Cargo.toml

# 5. Rust native unit tests
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## 2. Packaging Production Binaries

```bash
# Build native Windows installers and binaries (.exe / .msi)
npx tauri build
```

Artifacts are produced in `src-tauri/target/release/bundle/msi/` and `src-tauri/target/release/bundle/nsis/`.

---

## 3. Semantic Versioning Bump Flow

When updating the version, synchronize the following files simultaneously:

| Target File                          | Modification Scope                                             |
| :----------------------------------- | :------------------------------------------------------------- |
| `package.json`                       | `"version": "x.y.z"`                                           |
| `src-tauri/Cargo.toml`               | `version = "x.y.z"`                                            |
| `docs/ja/CHANGELOG.md`               | New release notes (Date, categories, changes)                  |
| `docs/en/CHANGELOG.md`               | New release notes in English                                   |
| `docs/ja/TODO.md`, `docs/en/TODO.md` | Reflect newly completed features                               |
| `README.md`, `README_JA.md`          | Update version shields badge and relevant highlights           |

---

## 4. GitHub Actions CI/CD Automation

Workflows under `.github/workflows/` automate quality checks and distribution:

- **CI (`ci.yml`)**: Automatically triggers Windows runner builds, unit tests, and caching via `rust-cache` on pull requests and pushes to main.
- **Release (`release.yml`)**: On `v*.*.*` git tag creation or manual workflow dispatch, packages native Windows installers and attaches them to GitHub Releases.
