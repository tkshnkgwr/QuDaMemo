# Contribution Guidelines (CONTRIBUTING.md) - QuDaMemo

**English Version** | [日本語版](../ja/CONTRIBUTING.md)

---

## 1. Development Principles & Core Guidelines

When contributing to QuDaMemo, all contributors and AI agents must strictly adhere to [RULES.md](../../RULES.md):

1. **No Breaking Modifications**: Do not alter styles, runtime behaviors, or component hierarchies outside the scope of requested tasks.
2. **Disciplined Markdown Table Alignment**: All tables in markdown files must maintain exact vertical alignment of pipes `|` and hyphens `-` with character-width padding for optimal plain-text viewing in editors like gVim (see [markdown-table skill](file:///.agents/skills/markdown-table/SKILL.md)).
3. **Environment Variable Path Standard**: Always reference local paths using environment variables like `%USERPROFILE%` rather than hardcoding user-specific local directories.
4. **Fast Documentation Workflow**: When modifying Markdown files exclusively (`*.md`), automated pre-verification commands may be bypassed for prompt updates.
5. **Multi-language Documentation Synchronization**: Any architectural, specification, or workflow changes must be updated synchronously in both Japanese (`docs/ja/`) and English (`docs/en/`).

---

## 2. Commit Message Conventions

Commit messages must follow structured prefix guidelines (detailed in the [git-commit skill](file:///.agents/skills/git-commit/SKILL.md)):

| Prefix         | Scope & Purpose                                                |
| :------------- | :------------------------------------------------------------- |
| `feat:`        | New user-facing features or capabilities                       |
| `fix:`         | Bug fixes and issue resolutions                                |
| `docs:`        | Documentation additions, corrections, and syncing              |
| `refactor:`    | Structural code refactoring without behavior alterations       |
| `perf:`        | Performance enhancements and low-resource optimizations        |
| `test:`        | Test suite additions, fixtures, and updates                    |
| `release:`     | Version bumps and formal release preparation                   |

> [!CAUTION]
> Autonomous Git staging, commits, or pushes by AI agents are **strictly prohibited**. Commits are executed only upon explicit chat instructions from the user.
