import { describe, it, expect } from 'vitest';
import { parseMarkdownFile, buildMarkdownFile } from './frontmatter';

describe('frontmatter ユーティリティの単体テスト', () => {
  it('YAML Frontmatterを含む全Markdownを正しくパースできること', () => {
    const raw = `---
title: "テストタイトル"
summary: "要約テキスト"
tags: ["React", "TypeScript"]
---
# 本文の見出し
これはテストの本文です。
`;

    const { frontmatter, content } = parseMarkdownFile(raw);

    expect(frontmatter.title).toBe('テストタイトル');
    expect(frontmatter.summary).toBe('要約テキスト');
    expect(frontmatter.tags).toEqual(['React', 'TypeScript']);
    expect(content.trim()).toBe('# 本文の見出し\nこれはテストの本文です。');
  });

  it('Frontmatterが存在しないMarkdownでも正常に本文が取得できること', () => {
    const raw = '# タイトルのみのメモ\nプレーンな本文です。';
    const { frontmatter, content } = parseMarkdownFile(raw);

    expect(frontmatter.tags).toEqual([]);
    expect(content).toBe('# タイトルのみのメモ\nプレーンな本文です。');
  });

  it('Frontmatterと本文を構築して単一のMarkdown形式に変換できること', () => {
    const frontmatter = {
      title: '生成タイトル',
      date: '2026-08-04',
      weekday: '火曜日',
      holiday: null,
      tags: ['Vitest', 'Test'],
      summary: '生成されたサマリー',
    };
    const content = '新しく書かれた本文です。';

    const result = buildMarkdownFile(frontmatter, content);

    expect(result).toContain('summary: 生成されたサマリー');
    expect(result).toContain('updated_at:');
    expect(result).toContain('新しく書かれた本文です。');
  });

  it('updated_atがフロントマターに記録・保持されること', () => {
    const raw = `---
date: "2026-08-07"
updated_at: "2026-08-07 04:15:00"
tags: ["Test"]
---
テスト本文`;
    const { frontmatter } = parseMarkdownFile(raw);
    expect(frontmatter.updated_at).toBe('2026-08-07 04:15:00');
  });
});
