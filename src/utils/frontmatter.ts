import { load, dump } from 'js-yaml';
import { MemoFrontmatter } from '../types';
import { getJapaneseWeekday, getHolidayName } from './holidays';

/**
 * YAMLフロントマターを含むMarkdownテキストをパースする
 */
export function parseMarkdownFile(rawContent: string, fallbackDateStr?: string): {
  frontmatter: MemoFrontmatter;
  content: string;
} {
  const dateToUse = fallbackDateStr || new Date().toISOString().slice(0, 10);
  const regex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = rawContent.match(regex);

  let parsedFm: Partial<MemoFrontmatter> = {};
  let bodyContent = rawContent;

  if (match) {
    try {
      const parsed = load(match[1]);
      if (typeof parsed === 'object' && parsed !== null) {
        parsedFm = parsed as Partial<MemoFrontmatter>;
      }
      bodyContent = match[2];
    } catch (e) {
      console.warn('YAMLフロントマターのパースに失敗しました:', e);
    }
  }

  // 編集不可項目（date, weekday, holiday）を正確に再計算・補正
  const dateVal = (parsedFm.date as string) || dateToUse;
  const weekdayVal = getJapaneseWeekday(dateVal);
  const holidayVal = getHolidayName(dateVal);
  const summaryVal = (parsedFm.summary as string) || (parsedFm.aiSummary as string) || undefined;
  const summaryTypeVal = (parsedFm.summary_type as string) || undefined;

  const tagsArray = Array.isArray(parsedFm.tags)
    ? parsedFm.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];

  const finalFrontmatter: MemoFrontmatter = {
    ...parsedFm,
    date: dateVal,
    weekday: weekdayVal,
    holiday: holidayVal,
    tags: tagsArray,
    ...(summaryVal ? { summary: summaryVal } : {}),
    ...(summaryTypeVal ? { summary_type: summaryTypeVal } : {}),
  };

  return {
    frontmatter: finalFrontmatter,
    content: bodyContent,
  };
}

/**
 * YAMLフロントマターヘッダーを含む完全なMarkdownテキストを構築する
 */
export function buildMarkdownFile(frontmatter: MemoFrontmatter, bodyContent: string): string {
  // 曜日と祝日名を正確に更新
  const weekdayVal = getJapaneseWeekday(frontmatter.date);
  const holidayVal = getHolidayName(frontmatter.date);

  const fmObject: MemoFrontmatter = {
    date: frontmatter.date,
    weekday: weekdayVal,
    holiday: holidayVal,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
  };

  if (frontmatter.summary) {
    fmObject.summary = frontmatter.summary;
  }
  if (frontmatter.summary_type) {
    fmObject.summary_type = frontmatter.summary_type;
  }

  const yamlString = dump(fmObject, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  }).trim();

  return `---\n${yamlString}\n---\n\n${bodyContent.trimStart()}`;
}

/**
 * プレビュー/表示用のYAMLフロントマター文字列をフォーマット生成する
 */
export function formatFrontmatterYaml(frontmatter: MemoFrontmatter): string {
  const weekdayVal = getJapaneseWeekday(frontmatter.date);
  const holidayVal = getHolidayName(frontmatter.date);

  const fmObject: Record<string, unknown> = {
    date: frontmatter.date,
    weekday: weekdayVal,
    holiday: holidayVal,
    tags: frontmatter.tags || [],
  };

  if (frontmatter.summary) {
    fmObject.summary = frontmatter.summary;
  }
  if (frontmatter.summary_type) {
    fmObject.summary_type = frontmatter.summary_type;
  }

  return dump(fmObject, { indent: 2, lineWidth: -1 }).trim();
}
