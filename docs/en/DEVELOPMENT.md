# Development Guide (DEVELOPMENT.md) - QuDaMemo

**English** | [日本語版](../ja/DEVELOPMENT.md)

## 1. Prerequisites
- **Node.js**: v18.0.0+
- **Rust**: v1.80.0+ (for Tauri v2)

## 2. Directory Structure
```
.
├── .agents/                 # AI Agent rules (AGENTS.md)
├── src/                     # React 19 / TypeScript Frontend
├── src-tauri/               # Tauri v2 Rust Backend
├── docs/                    # Multilingual Documentation (ja/ / en/)
└── package.json
```

## 3. Development Commands

```bash
# Run desktop app in development mode
npx tauri dev

# Production build
npx tauri build
```
