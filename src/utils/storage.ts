import { QuickMemo, AppSettings, MemoFrontmatter } from '../types';
import { buildMarkdownFile, parseMarkdownFile } from './frontmatter';
import { getJapaneseWeekday, getHolidayName } from './holidays';
import { exportFileWithDialog } from './dialog';
import { writeMemoToDisk, loadMemosFromDisk, deleteMemoFromDisk } from './fileStorage';
import { logger } from './logger';

// UPDATE [2026-08-03]: デフォルト保存先パスとストレージキーを QuDaMemo (QuickDailyMemo) に変更
const STORAGE_KEY_NOTES = 'qudamemo_notes_v1';
const STORAGE_KEY_SETTINGS = 'qudamemo_settings_v1';

// UPDATE [2026-08-03]: 実在するマイドキュメント配下の QuDaMemo/notes をデフォルトローカル保存先パスに設定
export const DEFAULT_SETTINGS: AppSettings = {
  storagePath: 'C:\\Users\\632792\\Documents\\QuDaMemo\\notes',
  configFilePath: './config.json',
  fileNameRule: 'YYYYMMDD.md',
  summaryRule: '30〜50文字程度で本日のメモの主要な出来事・タスク・決定事項を簡潔に要約してください。挨拶やプレフィックス（「要約：」等）は含めず、要約本文のみを出力してください。',
  geminiModel: 'gemini-3.6-flash',
  geminiApiKey: '',
  geminiBaseUrl: 'https://generativelanguage.googleapis.com',
  activeSummaryMode: 'api',
  useWebFallbackIfNoKey: true,
  defaultFrontmatterTemplate: `date: "{{date}}"\nweekday: "{{weekday}}"\nholiday: {{holiday}}\ntags:\n  - "日常"\n  - "メモ"`,
  theme: 'light',
  calendarStartDay: 'monday',
  autoSaveIntervalSeconds: 10,
  googleDriveEnabled: false,
  windowBounds: {
    x: 100,
    y: 80,
    width: 1120,
    height: 780,
    isMaximized: false,
  },
};

/**
 * UPDATE [2026-08-03]: 現在日付からのオフセット（日）を指定して YYYY-MM-DD 形式の文字列を取得するヘルパー
 */
function getOffsetDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * UPDATE [2026-08-03]: 初回起動時のデモ用サンプルメモデータを起動時の年月日に合わせて動的生成する
 */
function createSeedNotes(): QuickMemo[] {
  const todayStr = getOffsetDateStr(0);
  const yesterdayStr = getOffsetDateStr(-1);
  const dayBeforeYesterdayStr = getOffsetDateStr(-2);
  const nextWeekStr = getOffsetDateStr(7);
  const tenDaysAgoStr = getOffsetDateStr(-10);

  const seeds = [
    {
      date: todayStr,
      id: todayStr.replace(/-/g, ''),
      tags: ['仕事', 'React', 'Rust', '開発'],
      content: `# 本日の開発計画と振り返り\n\n1. QuDaMemo (QuickDailyMemo) のフロントエンド設計\n   - WindowsデスクトップUIの実現（タイトルバー、カレンダー、検索ハイライト）\n   - YAMLフロントマターの自動算出（曜日、祝日名）\n   - 1日1ファイルの厳密なファイル名制約 (YYYYMMDD.md)\n\n2. AI自動要約エンジンの組み込み\n   - Gemini APIとフォールバック要約ロジックの両立\n   - 入力画面終了時の自動要約トリガー\n\n3. 今後の展望\n   - Google Drive連携機能の準備とToml/Json設定保存\n   - タスクの進捗が非常によく順調に完了。`,
      aiSummary: 'QuDaMemo (QuickDailyMemo) の軽量デスクトップアプリ開発。YAMLフロントマター自動生成、カレンダー表示、検索ハイライト、AI自動要約機能を構築し順調に進行中。',
    },
    {
      date: yesterdayStr,
      id: yesterdayStr.replace(/-/g, ''),
      tags: ['要件定義', '設計', 'メモ'],
      content: `# アプリケーション仕様策定メモ\n\n- ローカルの指定フォルダに保存する仕様と指定UI\n- 保存ファイル名は「YYYYMMDD.md」形式とし1日1ファイルのみ作成\n- 入力画面は10行表示枠、行数表示、80バイト目安表示\n- カレンダー表示は月曜始まりで祝日（赤文字）をサポート\n- カーソルホバーで祝日名と要約を表示する`,
      aiSummary: '1日1ファイル制約や月曜始まりカレンダー、行数表示、要約ホバープレビュー等のコア仕様を策定。',
    },
    {
      date: dayBeforeYesterdayStr,
      id: dayBeforeYesterdayStr.replace(/-/g, ''),
      tags: ['振り返り', '学習', 'Rust'],
      content: `# 振り返りと学習メモ\n\n近所のカフェで集中して作業を行った。\n技術書を読破し、Rustの所有権システムとメモリ管理について再確認。\nアプリと同じ場所に設定ファイル(config.json)を作成し、起動時の年月日に併せたメモフォルダの自動生成ロジックも実装。`,
      aiSummary: 'カフェでの集中作業とRust所有権システムの再確認。アプリと同階層の設定ファイル(config.json)と起動年月日連動フォルダ作成仕様を反映。',
    },
    {
      date: nextWeekStr,
      id: nextWeekStr.replace(/-/g, ''),
      tags: ['予定', 'ハイキング', 'アウトドア'],
      content: `# 今後の予定と準備メモ\n\n- ハイキングの計画立案\n- 水分補給用のボトル、シューズのチェック\n- ルートの手配と確認`,
      aiSummary: '来週のハイキング計画と装備チェック・ルートの事前手配。',
    },
    {
      date: tenDaysAgoStr,
      id: tenDaysAgoStr.replace(/-/g, ''),
      tags: ['アイデア', '思考'],
      content: `# テキストエディタのキーボードショートカット検討\n\n- Ctrl + S で即時保存\n- Ctrl + P でプレビュー切り替え\n- Ctrl + N で本日のメモへジャンプ`,
      aiSummary: 'ショートカットキー（Ctrl+S, Ctrl+P, Ctrl+N）による操作性向上案の検討。',
    },
  ];

  return seeds.map((item) => {
    const weekday = getJapaneseWeekday(item.date);
    const holiday = getHolidayName(item.date);
    const fm: MemoFrontmatter = {
      date: item.date,
      weekday,
      holiday,
      tags: item.tags,
      summary: item.aiSummary,
    };
    const rawMarkdown = buildMarkdownFile(fm, item.content);
    return {
      id: item.id,
      date: item.date,
      filename: `${item.id}.md`,
      frontmatter: fm,
      content: item.content,
      rawMarkdown,
      aiSummary: item.aiSummary,
      updatedAt: new Date(item.date + 'T18:00:00').toISOString(),
    };
  });
}

/**
 * UPDATE [2026-08-03]: localStorageから設定を読み込む（旧要約ルールの最新マイグレーション対応）
 */
export function loadAppSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SETTINGS) || localStorage.getItem('quickmemo_settings_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      // 旧PathやダミーPathが含まれる場合は実在するパスへ補正
      if (!parsed.storagePath || parsed.storagePath.includes('Users\\AppData') || parsed.storagePath.includes('QuickMemo')) {
        parsed.storagePath = DEFAULT_SETTINGS.storagePath;
      }
      // UPDATE [2026-08-03]: 保存されている要約ルールが旧初期値の場合、最新のデフォルトルールへ更新する
      if (!parsed.summaryRule || parsed.summaryRule === '30〜50文字程度で本日のメモの要点を簡潔に要約してください。' || parsed.summaryRule.includes('要点を簡潔に要約')) {
        parsed.summaryRule = DEFAULT_SETTINGS.summaryRule;
      }
      const loaded = { ...DEFAULT_SETTINGS, ...parsed };
      logger.setStoragePath(loaded.storagePath);
      saveAppSettings(loaded);
      return loaded;
    }
  } catch (e) {
    console.error('設定の読み込みに失敗しました:', e);
  }

  // 初回起動時: 保存先フォルダを自動作成し、設定の「ローカルの保存フォルダ」および「config.json」にセットして永続化
  const initialSettings = { ...DEFAULT_SETTINGS };
  logger.setStoragePath(initialSettings.storagePath);
  saveAppSettings(initialSettings);
  return initialSettings;
}

/**
 * 設定をlocalStorageに保存する
 */
export function saveAppSettings(settings: AppSettings): void {
  try {
    logger.setStoragePath(settings.storagePath);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('設定の保存に失敗しました:', e);
  }
}

/**
 * localStorageからすべてのメモを読み込む
 */
export function loadAllMemos(): QuickMemo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTES) || localStorage.getItem('quickmemo_notes_v1');
    if (stored) {
      const parsed = JSON.parse(stored) as QuickMemo[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 年度の切り替わり等に対応するため、曜日・祝日・要約を最新のフロントマター・要約情報で更新
        return parsed.map((memo) => {
          const weekday = getJapaneseWeekday(memo.date);
          const holiday = getHolidayName(memo.date);
          memo.frontmatter.weekday = weekday;
          memo.frontmatter.holiday = holiday;
          
          const summaryVal = memo.frontmatter.summary || memo.aiSummary || '';
          if (summaryVal) {
            memo.frontmatter.summary = summaryVal;
            memo.aiSummary = summaryVal;
          }
          memo.rawMarkdown = buildMarkdownFile(memo.frontmatter, memo.content);
          memo.filename = `${memo.id}.md`;
          return memo;
        });
      }
    }
  } catch (e) {
    console.error('メモの読み込みに失敗しました:', e);
  }

  // デモ用の初期サンプルメモを生成
  const seeds = createSeedNotes();
  saveAllMemos(seeds);
  return seeds;
}

/**
 * メモ一覧をlocalStorageおよび物理ディスクの両方に保存・非同期同期する
 */
export function saveAllMemos(memos: QuickMemo[], settings?: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(memos));
  } catch (e) {
    console.error('メモの保存に失敗しました:', e);
  }

  // 設定されたローカルフォルダへ全ファイルをバックグラウンド保存同期
  if (settings?.storagePath) {
    memos.forEach((memo) => {
      writeMemoToDisk(settings.storagePath, memo, settings.fileNameRule).catch((err) =>
        console.warn(`Physical file write failed for ${memo.filename}:`, err)
      );
    });
  }
}

/**
 * 単一のメモを保存し、ローカルストレージおよび指定されたローカルフォルダへリアルタイム物理保存書き出しする
 */
export function saveSingleMemo(memo: QuickMemo, memos: QuickMemo[], settings?: AppSettings): QuickMemo[] {
  const existsIndex = memos.findIndex((m) => m.id === memo.id);
  let updatedMemos: QuickMemo[];
  if (existsIndex >= 0) {
    updatedMemos = [...memos];
    updatedMemos[existsIndex] = memo;
  } else {
    updatedMemos = [memo, ...memos];
  }

  // 内部ストレージへ保存
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updatedMemos));

  // 指定のローカルフォルダに物理 .md ファイルとして書き出し
  if (settings?.storagePath) {
    writeMemoToDisk(settings.storagePath, memo, settings.fileNameRule).catch((err) =>
      console.warn('Physical file sync failed:', err)
    );
  }

  return updatedMemos;
}

/**
 * 非同期ロード: 指定ローカルフォルダ内の物理.mdファイルを優先読み込みし、localStorageと同期する
 */
export async function loadAllMemosAsync(settings?: AppSettings): Promise<QuickMemo[]> {
  if (settings?.storagePath) {
    const diskMemos = await loadMemosFromDisk(settings.storagePath, settings.fileNameRule);
    if (diskMemos && diskMemos.length > 0) {
      saveAllMemos(diskMemos);
      return diskMemos;
    }
  }
  return loadAllMemos();
}

/**
 * メモを削除し、ローカルフォルダ内の物理 .md ファイルも削除する
 */
export async function deleteMemo(id: string, memos: QuickMemo[], settings?: AppSettings): Promise<QuickMemo[]> {
  const memoToDelete = memos.find((m) => m.id === id);
  const updatedMemos = memos.filter((m) => m.id !== id);

  saveAllMemos(updatedMemos);

  if (settings?.storagePath && memoToDelete) {
    await deleteMemoFromDisk(settings.storagePath, memoToDelete.filename);
  }

  return updatedMemos;
}

/**
 * UPDATE [2026-08-03]: メモファイル名の命名ルール(fileNameRule)に基づきファイル名を生成する
 */
export function formatMemoFilename(dateStr: string, fileNameRule?: string): string {
  const rule = fileNameRule && fileNameRule.trim() ? fileNameRule.trim() : 'YYYYMMDD.md';
  const idStr = dateStr.replace(/-/g, '');
  const [yyyy, mm, dd] = dateStr.split('-');

  let result = rule
    .replace(/\{\{date\}\}/g, dateStr)
    .replace(/\{\{date_nodash\}\}/g, idStr)
    .replace(/YYYYMMDD/g, idStr)
    .replace(/YYYY/g, yyyy || '')
    .replace(/MM/g, mm || '')
    .replace(/DD/g, dd || '');

  if (!result.endsWith('.md')) {
    result += '.md';
  }
  return result;
}

/**
 * 指定した日付（YYYY-MM-DD）のメモを取得または新規作成する（設定されたファイル名ルールを適用）
 */
export function getOrCreateMemoForDate(dateStr: string, memos: QuickMemo[], fileNameRule?: string): {
  memo: QuickMemo;
  updatedMemos: QuickMemo[];
  isNew: boolean;
} {
  const idStr = dateStr.replace(/-/g, '');
  const existing = memos.find((m) => m.id === idStr || m.date === dateStr);
  if (existing) {
    // 既存メモのファイル名をルールに合わせて更新
    const targetFilename = formatMemoFilename(dateStr, fileNameRule);
    if (existing.filename !== targetFilename) {
      existing.filename = targetFilename;
    }
    return { memo: existing, updatedMemos: memos, isNew: false };
  }

  // この日付の新しいメモを作成
  const weekday = getJapaneseWeekday(dateStr);
  const holiday = getHolidayName(dateStr);
  const frontmatter: MemoFrontmatter = {
    date: dateStr,
    weekday,
    holiday,
    tags: ['メモ'],
  };

  const initialContent = `# ${dateStr} のメモ\n\n`;
  const rawMarkdown = buildMarkdownFile(frontmatter, initialContent);

  const newMemo: QuickMemo = {
    id: idStr,
    date: dateStr,
    filename: formatMemoFilename(dateStr, fileNameRule),
    frontmatter,
    content: initialContent,
    rawMarkdown,
    aiSummary: '（要約未生成：入力完了時に要約が作成されます）',
    updatedAt: new Date().toISOString(),
  };

  const newMemosList = [newMemo, ...memos];
  saveAllMemos(newMemosList);
  return { memo: newMemo, updatedMemos: newMemosList, isNew: true };
}

/**
 * 単一のMarkdownファイル (.md) を指定ダイアログ / ローカルへ保存エクスポートする
 */
export async function downloadMarkdownFile(memo: QuickMemo, fileNameRule?: string): Promise<boolean> {
  const fileName = formatMemoFilename(memo.date, fileNameRule) || memo.filename;
  return await exportFileWithDialog(fileName, memo.rawMarkdown, 'text/markdown;charset=utf-8;');
}

/**
 * 高速クライアントサイド要約生成ロジック（キーセンテンス抽出フォールバック）
 */
export function generateFallbackSummary(content: string, dateStr: string): string {
  if (!content || !content.trim()) {
    return '（メモ内容が空のため要約はありません）';
  }

  // 見出し、空行、コードブロック等を除外
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('```'));

  if (lines.length === 0) {
    return `【${dateStr}】記録メモ。`;
  }

  // 先頭から最大3個の主要文を抽出して結合
  const keySentences = lines.slice(0, 3).map((l) => l.replace(/^[-*•\d+.\s]+/, ''));
  let summaryText = keySentences.join('。');
  if (summaryText.length > 120) {
    summaryText = summaryText.slice(0, 117) + '...';
  }
  if (!summaryText.endsWith('。') && !summaryText.endsWith('...')) {
    summaryText += '。';
  }

  return summaryText;
}
