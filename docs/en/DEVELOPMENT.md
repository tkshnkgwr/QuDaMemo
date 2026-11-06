# Development Guide (DEVELOPMENT.md) - QuDaMemo

**English** | [日本語版](../ja/DEVELOPMENT.md)

## 1. Prerequisites

- **Node.js**: v18.0.0+
- **Rust**: v1.80.0+ (for Tauri v2)

## 2. Directory Structure

```text
.
├── .agents/                 # AI Agent rules & skills (AGENTS.md)
├── src/                     # React 19 / TypeScript Frontend
│   ├── components/          # UI components (MemoEditor, CalendarView, etc.)
│   │   └── settings/        # Modular settings tabs (GeneralTab, AiTab, etc.)
│   ├── utils/               # Storage, frontmatter & holiday utilities
│   ├── types.ts             # TypeScript definitions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Frontend entry point
├── src-tauri/               # Tauri v2 Rust Backend
│   ├── src/                 # main.rs, lib.rs, commands.rs
│   ├── capabilities/        # Tauri v2 security capabilities
│   ├── icons/               # Application icons
│   ├── Cargo.toml           # Rust dependencies & optimization profiles
│   └── tauri.conf.json      # Tauri application configuration
├── docs/                    # Multilingual Documentation (ja/ / en/)
└── package.json
```

## 3. Development and Build Commands

### Start in Development Mode
```bash
npx tauri dev
```

### Frontend Validation & Testing
```bash
# TypeScript type check
npm run lint

# Vitest unit test execution
npm run test

# Vite production build
npm run build
```

### Tauri Rust Backend Validation & Testing
```bash
# Syntax and type check
cargo check --manifest-path src-tauri/Cargo.toml

# Rust backend unit tests
cargo test --manifest-path src-tauri/Cargo.toml
```

### Production Package Build
```bash
# Build native Windows executable
npx tauri build
```

### Documentation Generation (TypeDoc)
```bash
npm run doc
```
