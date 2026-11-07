# User Guide (USER_GUIDE.md) - QuDaMemo

**English Version** | [日本語版](../ja/USER_GUIDE.md)

---

## 1. Introduction

QuDaMemo (Quick Daily Memo) is an ultra-lightweight, responsive Daily Markdown Memo desktop application designed for frictionless capture of thoughts, work logs, and daily tasks.
Optimized to run smoothly even on lower-spec Windows machines, it offers full bidirectional interoperability with external editors like Obsidian.

---

## 2. Core Operations & Workflows

### 2.1 Creating and Editing Memos

- **Open Today's Memo**:
  - Click "Create Today's Memo" (the pen icon on the right side of the TitleBar) to immediately open today's file (e.g. `20261108.md`).
  - If a note for today already exists, it is loaded instantly. If not, it is created automatically with custom YAML Frontmatter.
- **Accessing Past Memos via Calendar**:
  - Click any day in the "Month Calendar" or "Week Calendar" on the main dashboard to open and edit that day's memo.
  - In the Week Calendar, hovering over any card triggers an interactive popup tracking your mouse cursor with the note's title and summary.
- **Editor Features**:
  - Supports standard Markdown syntax (headings, task lists `- [ ]`, code blocks, quotes).
  - Automatically updates the non-editable `updated_at` badge in the header whenever changes are saved.
  - Clicking "Close & Return to List" atomically saves your changes and accurately returns to the view you opened the memo from (Month Calendar, Week Calendar, or Standard List).

### 2.2 AI Summarization (Gemini)

- **Generating Summaries**:
  - Click the "AI Summarize" button (star icon) in the editor footer or toolbar to summarize your current note.
  - **Zero-Wait Exit**: You can click "Close & Return to List" immediately without waiting for AI processing; summary generation completes asynchronously in the background.
- **Customizing Summary Prompts**:
  - Navigate to the "AI & Summary" tab in Settings to customize your summary prompt rules (length, focus areas, bullet format).

### 2.3 AI Model Selection Guide

For daily note summarization, **`gemini-3.7-flash`** offers the best balance of speed and high reasoning quality.

| Model                  | Speed / Latency | Summary Quality | Characteristics & Recommended Usage                          |
| :--------------------- | :-------------- | :-------------- | :----------------------------------------------------------- |
| **`gemini-3.7-flash`** | ⚡ Ultra Fast   | ⭐⭐⭐⭐⭐ Best  | **[Default & Recommended]** State-of-the-art reasoning & speed|
| **`gemini-2.0-flash`** | ⚡ Ultra Fast   | ⭐⭐⭐⭐ High   | Ultra low-latency model for rapid processing                 |
| **`gemini-1.5-flash`** | 🟡 Moderate     | ⭐⭐⭐ Normal   | Previous gen; fully superseded by 3.7 Flash for daily notes  |
| **`gemini-1.5-pro`**   | 🐢 Slower       | ⭐⭐⭐⭐ High   | Backward compatibility for 2M+ long contexts or proxies      |

*Note: If your organizational environment uses custom proxies or restricted model names, you can choose "Custom Model" in Settings to manually type any model identifier.*

---

## 3. Settings Configuration (SettingsModal)

Click the gear icon in the TitleBar to open the 2-column Settings dialog:

1. 📂 **General**:
   - **Storage Path**: Local directory where daily `.md` notes are saved (e.g., `%USERPROFILE%\Documents\QuDaMemo\notes`).
   - **File Naming Rule**: Defaults to `YYYYMMDD`.
   - **Frontmatter Template**: Edit the default YAML metadata prepended to new memos.
   - **Auto-Save Interval**: Adjust frequency of auto-saving in seconds (default: 10s).
2. 🤖 **AI & Summary**:
   - **Gemini API Key**: Your API key from Google AI Studio.
   - **AI Model**: Select preset models or enter custom identifiers.
   - **Base URL**: Specify custom reverse proxy endpoints.
   - **AI Connection Test**: Dual diagnostic verifying direct API and proxy connectivity.
3. 🎨 **Theme**:
   - **Appearance**: Toggle between "Dark", "Light", or "System Theme".
   - **First Day of the Week**: Choose Monday or Sunday start for calendar views.
4. 📅 **Custom Holidays**:
   - Register custom corporate or personal anniversaries with dates and labels to display on calendars.
5. 📦 **Backup & Misc**:
   - **Export / Import Config**: Backup or restore your `config.json`.
   - **Clear Cache**: Reset temporary WebView2 cache (your physical `.md` notes are completely protected).

---

## 4. Help & System Utilities

Click the Help ("?") icon in the TitleBar to access system utilities:

- **Keyboard Shortcuts (F1)**:
  - Complete cheatsheet of keyboard shortcuts.
- **View App Logs**:
  - Live inspection modal for `qudamemo.log` with real-time refresh, copy, and clear options.
- **About QuDaMemo**:
  - Check current version, underlying engine details, and GPL-3.0-or-later license.

---

## 5. Obsidian Integration Tips

You can open QuDaMemo's storage directory (`%USERPROFILE%\Documents\QuDaMemo\notes`) directly as an Obsidian Vault.
Enjoy rapid daily recording and AI summaries in QuDaMemo during the workday, and use Obsidian later for graph views, deep link exploration, and long-term knowledge organization.
