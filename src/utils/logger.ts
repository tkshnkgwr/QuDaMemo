import { exists, mkdir, writeTextFile, readTextFile, remove, stat } from '@tauri-apps/plugin-fs';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const MAX_LOG_SIZE_BYTES = 500 * 1024; // 500 KB
const MAX_LOG_FILES = 3; // 最新3世代保持 (qudamemo.log, qudamemo.log.1, qudamemo.log.2)

class AppLogger {
  private storagePath: string = '';
  private memoryLogs: string[] = [];

  public setStoragePath(path: string) {
    this.storagePath = path;
  }

  private getFormattedTimestamp(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}.${ms}`;
  }

  /**
   * ログをファイルとコンソールに出力する
   */
  public log(level: LogLevel, message: string, details?: unknown) {
    const timestamp = this.getFormattedTimestamp();
    let logLine = `[${timestamp}] [${level}] ${message}`;
    if (details !== undefined) {
      if (details instanceof Error) {
        logLine += ` | Error: ${details.message}`;
      } else if (typeof details === 'object') {
        try {
          logLine += ` | Details: ${JSON.stringify(details)}`;
        } catch {
          logLine += ` | Details: ${String(details)}`;
        }
      } else {
        logLine += ` | ${String(details)}`;
      }
    }

    // コンソール出力
    switch (level) {
      case 'ERROR':
        console.error(logLine);
        break;
      case 'WARN':
        console.warn(logLine);
        break;
      default:
        console.log(logLine);
        break;
    }

    // メモリログに追加（最新100件）
    this.memoryLogs.push(logLine);
    if (this.memoryLogs.length > 100) {
      this.memoryLogs.shift();
    }

    // ディスクへの非同期ローテーション書き出し
    this.appendLogToDisk(logLine).catch((err) => {
      console.warn('Failed to append log to disk:', err);
    });
  }

  public info(message: string, details?: unknown) {
    this.log('INFO', message, details);
  }

  public warn(message: string, details?: unknown) {
    this.log('WARN', message, details);
  }

  public error(message: string, details?: unknown) {
    this.log('ERROR', message, details);
  }

  public debug(message: string, details?: unknown) {
    this.log('DEBUG', message, details);
  }

  /**
   * 物理ログファイルへのローテーション書き出し処理
   */
  private async appendLogToDisk(logLine: string): Promise<void> {
    if (!this.storagePath || !this.storagePath.trim()) return;

    try {
      const separator = this.storagePath.endsWith('\\') || this.storagePath.endsWith('/') ? '' : '\\';
      const logDir = `${this.storagePath}${separator}logs`;

      // ログフォルダが存在しなければ自動作成
      const dirExist = await exists(logDir);
      if (!dirExist) {
        await mkdir(logDir, { recursive: true });
      }

      const mainLogFile = `${logDir}${separator}qudamemo.log`;

      // ファイルサイズをチェックしてローテーション判定
      const fileExist = await exists(mainLogFile);
      if (fileExist) {
        try {
          const fileStat = await stat(mainLogFile);
          if (fileStat.size >= MAX_LOG_SIZE_BYTES) {
            await this.rotateLogFiles(logDir, separator);
          }
        } catch {
          // statが使えない場合は無視して追記
        }
      }

      // 既存ログの読み込みと追記（または新規作成）
      let currentContent = '';
      if (await exists(mainLogFile)) {
        currentContent = await readTextFile(mainLogFile);
      }

      const newContent = currentContent ? `${currentContent}\n${logLine}` : logLine;
      await writeTextFile(mainLogFile, newContent);
    } catch (err) {
      // ログ追記失敗時は無視して動作を継続
    }
  }

  /**
   * ログファイルの自動ローテーション処理 (qudamemo.log -> qudamemo.log.1 -> qudamemo.log.2)
   */
  private async rotateLogFiles(logDir: string, separator: string): Promise<void> {
    try {
      // 古いファイルから順にシフト
      for (let i = MAX_LOG_FILES - 1; i >= 1; i--) {
        const srcPath = i === 1 ? `${logDir}${separator}qudamemo.log` : `${logDir}${separator}qudamemo.log.${i - 1}`;
        const destPath = `${logDir}${separator}qudamemo.log.${i}`;

        if (await exists(srcPath)) {
          if (i === MAX_LOG_FILES - 1 && (await exists(destPath))) {
            await remove(destPath);
          }
          const content = await readTextFile(srcPath);
          await writeTextFile(destPath, content);
        }
      }

      // メインログファイルをリセット
      const mainLogFile = `${logDir}${separator}qudamemo.log`;
      if (await exists(mainLogFile)) {
        await writeTextFile(mainLogFile, `[${this.getFormattedTimestamp()}] [INFO] --- Log file rotated ---`);
      }
    } catch (err) {
      console.warn('Log rotation failed:', err);
    }
  }

  public getRecentLogs(): string[] {
    return [...this.memoryLogs];
  }

  /**
   * 物理ディスクのログファイル (qudamemo.log) を読み込み、取得する
   */
  public async readFullLogFromDisk(): Promise<string> {
    if (this.storagePath) {
      try {
        const separator = this.storagePath.endsWith('\\') || this.storagePath.endsWith('/') ? '' : '\\';
        const mainLogFile = `${this.storagePath}${separator}logs${separator}qudamemo.log`;
        if (await exists(mainLogFile)) {
          return await readTextFile(mainLogFile);
        }
      } catch (err) {
        console.warn('Failed to read log file from disk:', err);
      }
    }
    return this.memoryLogs.join('\n') || '（ログデータはありません）';
  }

  /**
   * メモリおよび物理ディスクのログデータをクリアする
   */
  public async clearLogs(): Promise<void> {
    this.memoryLogs = [];
    if (this.storagePath) {
      try {
        const separator = this.storagePath.endsWith('\\') || this.storagePath.endsWith('/') ? '' : '\\';
        const mainLogFile = `${this.storagePath}${separator}logs${separator}qudamemo.log`;
        if (await exists(mainLogFile)) {
          await writeTextFile(mainLogFile, `[${this.getFormattedTimestamp()}] [INFO] Logs cleared by user.\n`);
        }
      } catch (err) {
        console.warn('Failed to clear log file:', err);
      }
    }
  }
}

export const logger = new AppLogger();
