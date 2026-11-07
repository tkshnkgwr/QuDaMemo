# Testing Strategy (TESTING.md) - QuDaMemo

**English Version** | [日本語版](../ja/TESTING.md)

---

## 1. Testing Principles & Quality Policy

QuDaMemo utilizes a multi-tiered verification strategy to ensure high reliability on low-spec hardware and guarantee user data safety.

| Test Category        | Target Scope                         | Tools / Commands                                       | Acceptance Criteria                           |
| :------------------- | :----------------------------------- | :----------------------------------------------------- | :-------------------------------------------- |
| **Static Analysis**  | All frontend source (`*.ts, *.tsx`)  | `npm run lint` (`tsc --noEmit`)                        | 0 type errors                                 |
| **Frontend Unit**    | Utilities, Frontmatter, Holidays     | `npm run test` (Vitest)                                | Accurate parsing & holiday calculations       |
| **Rust Backend Unit**| Disk I/O, parsing, config store      | `cargo test --manifest-path src-tauri/Cargo.toml`      | Atomic writes, dual backup safety, no leaks   |
| **Rust Syntax Check**| Tauri backend compilation            | `cargo check --manifest-path src-tauri/Cargo.toml`     | Clean compilation without warnings or errors  |
| **Production Build** | Vite bundle generation               | `npm run build`                                        | Clean production bundle creation              |
| **Resource Profiling**| Memory footprint & CPU utilization  | Process metrics / footprint diagnostics                | Idle RAM < 80MB, CPU < 1%                     |

---

## 2. Local Verification Process

When modifying source code, run the following sequence:

```bash
# 1. TypeScript static type check
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

> [!NOTE]
> When modifying Markdown files exclusively (`*.md`), test suite execution is bypassed per RULES.md for rapid turnaround.
