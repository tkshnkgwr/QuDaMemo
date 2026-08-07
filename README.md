# QuDaMemo (Quick Daily Memo)

[![Version](https://img.shields.io/badge/version-1.0.8-blue.svg)](package.json)
[![Tauri](https://img.shields.io/badge/tauri-v2-blue.svg)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/rust-1.80%2B-orange.svg)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#license)

> Low-resource targeted Daily Markdown Note desktop application powered by Tauri v2, Vite, React 19, and Rust. Engineered for ultra-fast, lightweight daily memoing and AI-assisted summaries.

**English** | [日本語版 (README_JA.md)](README_JA.md)

- [Japanese Documentation (docs/ja/)](docs/ja/SPECIFICATION.md)
- [English Documentation (docs/en/)](docs/en/SPECIFICATION.md)

---

## 🌟 Key Features

- **⚡ Ultra-fast Daily Memoing**: Automatic file naming (`YYYYMMDD.md`), automated YAML frontmatter insertion, and holiday detection.
- **✨ Frameless Minimal UI**: Modern frameless (`decorations: false`), transparent, low-resource desktop window.
- **🤖 AI Summary Engine**: Customizable Gemini models (`gemini-3.6-flash`, `gemini-3.6-pro`, etc.) with custom prompt rules.
- **📁 Obsidian / Markdown Compatibility**: Native Markdown storage, custom YAML metadata management.
- **🪶 Low CPU & Memory Optimization**: Minimal CPU/RAM overhead tailored for low-spec PCs.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/) (v1.80+)

### Development Mode

```bash
# 1. Install dependencies
npm install

# 2. Run Tauri v2 desktop application in dev mode
npx tauri dev
```

### Production Build

```bash
# Build native Windows executable
npx tauri build
```

---

## 📄 License
MIT License
