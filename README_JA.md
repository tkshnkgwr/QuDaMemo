# QuDaMemo (Quick Daily Memo) - 日本語概要

[![Version](https://img.shields.io/badge/version-1.0.8-blue.svg)](package.json)
[![Tauri](https://img.shields.io/badge/tauri-v2-blue.svg)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/rust-1.80%2B-orange.svg)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#ライセンス)

> 低リソース環境 (スペックの限られたPC) に最適化された、超高速・軽量なデイリーMarkdownメモ＆AI要約デスクトップアプリケーション。Tauri v2、Vite、React 19、および Rust により構築されています。

[English Version (README.md)](README.md) | **日本語版**

- [日本語ドキュメント仕様書 (docs/ja/SPECIFICATION.md)](docs/ja/SPECIFICATION.md)
- [英語版ドキュメント仕様書 (docs/en/SPECIFICATION.md)](docs/en/SPECIFICATION.md)

---

## 🌟 主な機能

- **⚡ 超高速デイリーメモ管理**: 自動ファイル命名 (`YYYYMMDD.md`)、Frontmatter自動付与、祝日判定。
- **✨ 枠なしモダンUI**: 背景透過・枠なし (`decorations: false`) の洗練されたデスクトップウィンドウ。
- **🤖 AI要約機能**: カスタマイズ可能なGeminiモデル（`gemini-3.6-flash`, `gemini-3.6-pro` 等）およびカスタムプロンプト（要約ルール）の設定。
- **📁 Obsidian互換**: 標準Markdown形式、frontmatterの柔軟なカスタマイズ。
- **🪶 低リソース最適化**: 低メモリ/CPU消費で快適に動作。

---

## 🚀 開発・起動手順

### 必須環境
- [Node.js](https://nodejs.org/) (v18以上)
- [Rust](https://www.rust-lang.org/) (v1.80以上)

### 開発モードでの起動

```bash
# 1. 依存関係のインストール
npm install

# 2. Tauri v2 デスクトップアプリの開発起動
npx tauri dev
```

### プロダクションビルド

```bash
# Windowsネイティブ実行ファイルのビルド
npx tauri build
```

---

## 📄 ライセンス
MIT License
