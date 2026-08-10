import { invoke } from '@tauri-apps/api/core';
import { exists, mkdir, writeTextFile, readTextFile, readDir, remove } from '@tauri-apps/plugin-fs';
import { QuickMemo } from '../types';
import { parseMarkdownFile, buildMarkdownFile } from './frontmatter';
import { formatMemoFilename, resolveDefaultConfigPath } from './storage';
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
 * 単一メモをローカルの物理ファイル (.md) として書き出し保存する（Rustネイティブコマンド優先で爆速保存）
 */
export async function writeMemoToDisk(
  storagePath: string,
  memo: QuickMemo,
  fileNameRule?: string
): Promise<boolean> {
  if (!storagePath || !storagePath.trim()) return false;

  const contentToWrite = memo.rawMarkdown || buildMarkdownFile(memo.frontmatter, memo.content);
  const actualFileName = formatMemoFilename(memo.date, fileNameRule) || memo.filename;

  // 1. Rust ネイティブ爆速コマンドの実行を試行
  try {
    await invoke('save_memo_file', {
      storagePath,
      memo: {
        id: memo.id,
        date: memo.date,
        filename: actualFileName,
        content: memo.content,
        rawMarkdown: contentToWrite,
        aiSummary: memo.aiSummary || '',
        frontmatter: memo.frontmatter,
        updatedAt: memo.updatedAt || new Date().toISOString(),
      },
    });
    logger.info(`【Rust爆速保存完了】: ${actualFileName}`);
    return true;
  } catch (rustErr) {
    // 2. Tauri JSプラグインフォールバック
    try {
      await ensureDirectoryExists(storagePath);
      const separator = storagePath.endsWith('\\') || storagePath.endsWith('/') ? '' : '\\';
      const filePath = `${storagePath}${separator}${actualFileName}`;
      await writeTextFile(filePath, contentToWrite);
      logger.info(`物理ファイル保存完了 (Plugin Fallback): ${actualFileName}`);
      return true;
    } catch (err) {
      logger.error(`物理ファイル保存エラー: ${memo.filename}`, err);
      return false;
    }
  }
}

/**
 * 指定されたローカルフォルダ内のすべての .md ファイルをスキャンして一括読み込みする（Rustネイティブで高速スキャン）
 */
export async function loadMemosFromDisk(
  storagePath: string,
  fileNameRule?: string
): Promise<QuickMemo[] | null> {
  if (!storagePath || !storagePath.trim()) return null;

  // 1. Rust ネイティブ爆速並列読み込みコマンドを優先呼出し
  try {
    const loaded = await invoke<QuickMemo[]>('load_all_memos', { storagePath });
    if (Array.isArray(loaded)) {
      logger.info(`【Rust爆速スキャン完了】全 ${loaded.length} 件のメモを並列読み込みしました`);
      return loaded;
    }
  } catch (rustErr) {
    logger.warn('Rust ネイティブコマンド無効。Tauri Plugin フォールバックを使用します:', rustErr);
  }

  // 2. JS プラグインフォールバック
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

    loadedMemos.sort((a, b) => b.date.localeCompare(a.date));
    return loadedMemos;
  } catch (err) {
    console.warn('Failed to load memos from disk:', err);
    return null;
  }
}

/**
 * ローカルディスクから物理ファイルを削除する（Rustネイティブ高速削除）
 */
export async function deleteMemoFromDisk(
  storagePath: string,
  fileName: string
): Promise<boolean> {
  if (!storagePath || !fileName) return false;
  const memoId = fileName.replace(/\.md$/i, '');

  try {
    await invoke('delete_memo_file', { storagePath, memoId });
    logger.info(`【Rust爆速削除完了】: ${fileName}`);
    return true;
  } catch (rustErr) {
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
}

/**
 * AppSettings を設定ファイル (config.json) へ書き込み保存する（Rustネイティブ爆速保存＋バックアップ多重化）
 */
export async function saveConfigFileToDisk(settings: import('../types').AppSettings): Promise<boolean> {
  const targetConfigPath =
    settings.configFilePath && !settings.configFilePath.startsWith('.')
      ? settings.configFilePath
      : resolveDefaultConfigPath(settings.storagePath);

  const jsonStr = JSON.stringify(settings, null, 2);

  // 1. Rust ネイティブコマンドによる確実な物理保存
  try {
    await invoke('save_app_config', {
      configPath: targetConfigPath,
      configJson: jsonStr,
    });
    logger.info(`【Rust爆速保存完了】設定ファイル (config.json) へ保存しました: ${targetConfigPath}`);

    // バックアップとしてノートフォルダ直下 (storagePath/config.json) にも書き込み
    if (settings.storagePath) {
      const sep = settings.storagePath.endsWith('\\') || settings.storagePath.endsWith('/') ? '' : '\\';
      const backupPath = `${settings.storagePath}${sep}config.json`;
      if (backupPath !== targetConfigPath) {
        invoke('save_app_config', {
          configPath: backupPath,
          configJson: jsonStr,
        }).catch(() => {});
      }
    }
    return true;
  } catch (rustErr) {
    logger.warn('Rust ネイティブ設定保存コマンド失敗。プラグインフォールバックを試行します:', rustErr);
  }

  // 2. Tauri JS プラグインフォールバック
  try {
    await writeTextFile(targetConfigPath, jsonStr);
    logger.info(`設定ファイル保存完了 (Plugin Fallback): ${targetConfigPath}`);
    return true;
  } catch (err) {
    try {
      if (settings.storagePath) {
        await ensureDirectoryExists(settings.storagePath);
        const separator = settings.storagePath.endsWith('\\') || settings.storagePath.endsWith('/') ? '' : '\\';
        const fallbackConfigPath = `${settings.storagePath}${separator}config.json`;
        await writeTextFile(fallbackConfigPath, jsonStr);
        logger.info(`保存先フォルダ内設定ファイルへ保存しました: ${fallbackConfigPath}`);
        return true;
      }
    } catch (fallbackErr) {
      logger.warn('設定ファイルの書き込みに失敗しました:', err);
    }
    return false;
  }
}

/**
 * 設定ファイル (config.json) から AppSettings を読み込む（Rustネイティブ優先＋多重フォールバック）
 */
export async function loadConfigFileFromDisk(
  configFilePath?: string,
  storagePath?: string
): Promise<Partial<import('../types').AppSettings> | null> {
  const candidatePaths: string[] = [];

  if (configFilePath && !configFilePath.startsWith('.')) {
    candidatePaths.push(configFilePath);
  }
  const derivedParentPath = resolveDefaultConfigPath(storagePath);
  if (!candidatePaths.includes(derivedParentPath)) {
    candidatePaths.push(derivedParentPath);
  }
  if (storagePath) {
    const sep = storagePath.endsWith('\\') || storagePath.endsWith('/') ? '' : '\\';
    const notesConfigPath = `${storagePath}${sep}config.json`;
    if (!candidatePaths.includes(notesConfigPath)) {
      candidatePaths.push(notesConfigPath);
    }
  }

  // 1. Rust ネイティブコマンドで候補パスを順次ロード試行
  for (const candidate of candidatePaths) {
    try {
      const jsonStr = await invoke<string>('load_app_config', { configPath: candidate });
      if (jsonStr && jsonStr.trim()) {
        const parsed = JSON.parse(jsonStr);
        logger.info(`【Rust爆速読込完了】設定ファイル (config.json) を読み込みました: ${candidate}`);
        return parsed;
      }
    } catch (rustErr) {
      // 候補パスが存在しない場合は次の候補へ
    }
  }

  // 2. Tauri JS プラグインフォールバック
  for (const candidate of candidatePaths) {
    try {
      const isExist = await exists(candidate);
      if (isExist) {
        const text = await readTextFile(candidate);
        const parsed = JSON.parse(text);
        logger.info(`設定ファイル (config.json) を読み込みました (Plugin): ${candidate}`);
        return parsed;
      }
    } catch (err) {
      // 次の候補へ
    }
  }

  return null;
}


