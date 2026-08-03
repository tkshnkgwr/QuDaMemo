import { open, save } from '@tauri-apps/plugin-dialog';

/**
 * フォルダ選択ダイアログを開き、選択されたディレクトリパスを返す。
 * キャンセル時、またはダイアログ未利用時は null を返す。
 */
export async function pickDirectory(defaultPath?: string): Promise<string | null> {
  try {
    const targetPath = defaultPath?.trim() || undefined;
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: targetPath,
      title: 'ローカルの保存フォルダを選択',
    });
    if (typeof selected === 'string') {
      return selected;
    }
    return null;
  } catch (err) {
    console.warn('Tauri directory dialog error or not running in Tauri window:', err);
    return null;
  }
}

/**
 * Webブラウザ用 Blob ダウンロードフォールバック
 */
export function saveBlobFallback(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 保存ダイアログを表示してファイルを指定場所へエクスポートする。
 */
export async function exportFileWithDialog(
  defaultFileName: string,
  content: string,
  mimeType = 'text/markdown;charset=utf-8;'
): Promise<boolean> {
  try {
    const ext = defaultFileName.split('.').pop() || 'md';
    const filePath = await save({
      defaultPath: defaultFileName,
      filters: [
        {
          name: 'Export File',
          extensions: [ext],
        },
      ],
    });

    if (filePath) {
      saveBlobFallback(defaultFileName, content, mimeType);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Tauri save dialog error, fallback to browser download:', err);
    saveBlobFallback(defaultFileName, content, mimeType);
    return true;
  }
}
