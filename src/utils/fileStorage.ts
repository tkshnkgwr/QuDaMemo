import { exists, mkdir, writeTextFile, readTextFile, readDir, remove } from '@tauri-apps/plugin-fs';
import { QuickMemo } from '../types';
import { parseMarkdownFile, buildMarkdownFile } from './frontmatter';
import { formatMemoFilename } from './storage';
import { logger } from './logger';

/**
 * 指定されたローカルフォルダが存在することを確認し、なければ新規作成する
 */
export async function ensureDirectoryExists(dirPath: string): Promise<boolean> {
  if (!dirPath || !dirPath.trim()) return false;
  try {
    const isExist = await exists(dirPath);
    if (!isExist) {
      await mkdir(dirPath, { recursive: true });
      logger.info(`ローカル保存先フォルダを作成しました: ${dirPath}`);
    }
    return true;
  } catch (err) {
    logger.warn(`フォルダチェック/作成失敗: ${dirPath}`, err);
    return false;
  }
}

/**
 * 単一メモをローカルの物理ファイル (.md) として書き出し保存する
 */
export async function writeMemoToDisk(
  storagePath: string,
  memo: QuickMemo,
  fileNameRule?: string
): Promise<boolean> {
  if (!storagePath || !storagePath.trim()) return false;

  try {
    await ensureDirectoryExists(storagePath);

    const actualFileName = formatMemoFilename(memo.date, fileNameRule) || memo.filename;
    const separator = storagePath.endsWith('\\') || storagePath.endsWith('/') ? '' : '\\';
    const filePath = `${storagePath}${separator}${actualFileName}`;

    const contentToWrite = memo.rawMarkdown || buildMarkdownFile(memo.frontmatter, memo.content);

    await writeTextFile(filePath, contentToWrite);
    logger.info(`物理ファイル保存完了: ${actualFileName} (パス: ${filePath})`);
    return true;
  } catch (err) {
    logger.error(`物理ファイル保存エラー: ${memo.filename}`, err);
    return false;
  }
}

/**
 * 指定されたローカルフォルダ内のすべての .md ファイルをスキャンしてメモデータとして一括読み込みする
 */
export async function loadMemosFromDisk(
  storagePath: string,
  fileNameRule?: string
): Promise<QuickMemo[] | null> {
  if (!storagePath || !storagePath.trim()) return null;

  try {
    const dirExist = await exists(storagePath);
    if (!dirExist) {
      return null;
    }

    const entries = await readDir(storagePath);
    const mdFiles = entries.filter(
      (entry) => entry.isFile && entry.name && entry.name.toLowerCase().endsWith('.md')
    );

    if (mdFiles.length === 0) {
      return [];
    }

    const separator = storagePath.endsWith('\\') || storagePath.endsWith('/') ? '' : '\\';
    const loadedMemos: QuickMemo[] = [];

    for (const entry of mdFiles) {
      if (!entry.name) continue;
      const fullPath = `${storagePath}${separator}${entry.name}`;
      try {
        const rawContent = await readTextFile(fullPath);
        const { frontmatter, content } = parseMarkdownFile(rawContent);

        // ファイル名または日付からIDを取得
        const dateStr = frontmatter.date || new Date().toISOString().slice(0, 10);
        const id = dateStr.replace(/-/g, '');
        const filename = formatMemoFilename(dateStr, fileNameRule) || entry.name;

        loadedMemos.push({
          id,
          date: dateStr,
          filename,
          frontmatter,
          content,
          rawMarkdown: rawContent,
          aiSummary: frontmatter.summary || '',
          updatedAt: new Date().toISOString(),
        });
      } catch (fileErr) {
        console.warn(`Failed to read file: ${entry.name}`, fileErr);
      }
    }

    // 日付降順でソート
    loadedMemos.sort((a, b) => b.date.localeCompare(a.date));
    return loadedMemos;
  } catch (err) {
    console.warn('Failed to load memos from disk:', err);
    return null;
  }
}

/**
 * ローカルディスクから物理ファイルを削除する
 */
export async function deleteMemoFromDisk(
  storagePath: string,
  fileName: string
): Promise<boolean> {
  if (!storagePath || !fileName) return false;
  try {
    const separator = storagePath.endsWith('\\') || storagePath.endsWith('/') ? '' : '\\';
    const filePath = `${storagePath}${separator}${fileName}`;
    const fileExist = await exists(filePath);
    if (fileExist) {
      await remove(filePath);
    }
    return true;
  } catch (err) {
    console.warn('Failed to delete physical file from disk:', err);
    return false;
  }
}
