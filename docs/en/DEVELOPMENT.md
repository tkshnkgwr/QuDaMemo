# Development Guide (DEVELOPMENT.md) - QuDaMemo

**English Version** | [日本語版](../ja/DEVELOPMENT.md)

---

## 1. Prerequisites & Environment

| Tool / Runtime      | Recommended Version | Purpose & Usage                                              |
| :------------------ | :------------------ | :----------------------------------------------------------- |
| **Node.js**         | v18.0.0 or higher   | Frontend development and package execution runtime           |
| **Rust**            | v1.80.0 or higher   | Tauri v2 backend and native core engine                      |
| **npm**             | v9.0.0 or higher    | Frontend dependency management                               |
| **OS**              | Windows 10/11       | Primary target desktop environment (WebView2)                |

---

## 2. Directory Layout

```text
.
├── .agents/                 # AI Agent instructions and workspace skills
│   ├── AGENTS.md            # Agent development guidelines
│   └── skills/              # Specialized agent workflows
│       ├── git-commit/      # Git commit standards & safe execution
│       ├── markdown-table/  # Markdown table vertical alignment guide
│       ├── tauri-verification/ # Rust & Frontend pre-verification workflow
│       └── vault-memo/      # Obsidian Vault fleeting note capture
├── src/                     # React 19 / TypeScript Frontend
│   ├── components/          # UI Components (Editor, Calendar, TitleBar, etc.)
│   │   └── settings/        # Settings modal sub-tabs (5 modular sub-components)
│   ├── utils/               # Storage, Frontmatter parser, Holiday detector, Logger
│   ├── types.ts             # TypeScript definitions (Frontmatter, QuickMemoDto, AppSettings)
│   ├── App.tsx              # Root application component
│   ├── main.tsx             # Frontend entry point
│   └── index.css            # Global styling (TailwindCSS)
├── src-tauri/               # Tauri v2 Rust Backend
│   ├── src/                 # Rust Source code
│   │   ├── commands.rs      # Tauri IPC command definitions
│   │   ├── lib.rs           # Core engine (Parsing, Atomic I/O, Config persistence)
│   │   └── main.rs          # Backend entry point
│   ├── capabilities/        # Tauri v2 capability security policies (default.json)
│   ├── icons/               # Multi-platform application icons
│   ├── Cargo.toml           # Rust dependencies and release build optimizations
│   └── tauri.conf.json      # Tauri app configuration (Frameless, transparency, bundling)
├── docs/                    # Multi-language documentation suite (ja/ & en/)
├── README.md                # English repository overview
├── README_JA.md             # Japanese repository overview
├── RULES.md                 # Primary workspace immutable rules
├── GEMINI.md                # AI Agent workspace directives
└── package.json             # Project configuration and frontend dependencies
```

---

## 3. Development & Verification Commands

### 3.1 Running in Development Mode
```bash
# Install dependencies
npm install

# Launch Tauri v2 desktop app in dev mode (supports Hot Reload)
npx tauri dev
```

### 3.2 Frontend Verification
```bash
# TypeScript static type check (zero errors required)
npm run lint

# Run unit tests (Vitest: Frontmatter parsing, Holiday detection)
npm run test

# Production bundle build verification
npm run build
```

### 3.3 Rust Backend Verification
```bash
# Rust compiler syntax and check
cargo check --manifest-path src-tauri/Cargo.toml

# Run native Rust unit tests (parsing, atomic I/O, config persistence)
cargo test --manifest-path src-tauri/Cargo.toml

# Check code formatting
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
```

### 3.4 Production Installer Packaging
```bash
# Generate native Windows installers (.msi / .exe)
npx tauri build
```

### 3.5 Documentation Generation (TypeDoc)
```bash
npm run doc
```

---

## 4. Development Standards & Workflow

Development in this repository is governed by the principles in [RULES.md](../../RULES.md):

1. **No Autonomous Commits/Pushes**: Git additions, commits, and pushes are strictly prohibited unless explicitly requested by the user in chat.
2. **Strict Markdown Table Alignment**: All tables must maintain disciplined vertical alignment of pipes `|` and hyphens `-` for clean plain-text viewing in editors like gVim.
3. **Environment Variable Path Standard**: Local user paths must consistently use `%USERPROFILE%` rather than hardcoded usernames.
4. **Fast Documentation Workflow**: Pure Markdown edits (`*.md`) bypass code pre-verification (`cargo check`, `npm test`) for rapid turnaround.
