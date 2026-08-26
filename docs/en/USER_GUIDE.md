# User Guide (USER_GUIDE.md) - QuDaMemo

**English Version** | [日本語版](../ja/USER_GUIDE.md)

## 1. Overview
QuDaMemo provides rapid daily note-taking and one-click AI summary generation.

## 2. Core Workflows

### 2.1 Daily Memo Creation

- Click any calendar date or "Create Today's Memo" to automatically open `YYYYMMDD.md`.
- Edit content using Markdown syntax.

### 2.2 AI Summarization

- Click the **AI Summary** button (star icon).
- The selected Gemini model (e.g., `gemini-3.7-flash`, `gemini-2.5-pro`, or custom model) will generate a concise summary based on your prompt rule.

### 2.3 Settings Customization

- Open Settings (gear icon).
- Select your preferred **AI Model** from presets (including `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-2.5-pro`, etc.) or manually input any custom model name, and customize your **Summary Prompt Rule**.

### 2.4 AI Model Selection Guide

For daily memo summarization, **`gemini-3.7-flash`** is strongly recommended for optimal speed and accuracy.

| Model                  | Latency / Speed | Quality        | Characteristics & Recommended Use             |
| :--------------------- | :-------------- | :------------- | :-------------------------------------------- |
| **`gemini-3.7-flash`** | ⚡ Ultra-Fast   | ⭐⭐⭐⭐⭐ Top   | **[Default & Recommended]** Hybrid reasoning  |
| **`gemini-2.0-flash`** | ⚡ Ultra-Fast   | ⭐⭐⭐⭐ High   | Low-latency high-throughput standard          |
| **`gemini-1.5-flash`** | 🟡 Moderate     | ⭐⭐⭐ Normal   | Previous gen; 3.7 Flash is completely superior|
| **`gemini-1.5-pro`**   | 🐢 Slower       | ⭐⭐⭐⭐ High   | For massive 2M-token inputs & enterprise proxy|

*Note: 1.5 models are NOT faster than 2.0 / 3.x Flash. Use 3.7 Flash unless your corporate proxy or cloud contract strictly restricts approved models to the 1.5 series.*

