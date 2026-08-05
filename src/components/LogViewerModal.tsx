import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { Terminal, X, Copy, Trash2, RefreshCw, Check } from 'lucide-react';

interface LogViewerModalProps {
  onClose: () => void;
}

export const LogViewerModal: React.FC<LogViewerModalProps> = ({ onClose }) => {
  const [logText, setLogText] = useState<string>('ログを読み込んでいます...');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const content = await logger.readFullLogFromDisk();
      setLogText(content || '（ログメッセージはありません）');
    } catch {
      setLogText('ログの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(logText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = async () => {
    if (confirm('ログデータをクリアしてもよろしいですか？')) {
      await logger.clearLogs();
      await fetchLogs();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl h-[560px] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">アプリケーション ログビューア</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                QuDaMemo 動作ログ (`qudamemo.log`) の確認とデバッグ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col bg-slate-950">
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed text-emerald-400 whitespace-pre-wrap select-text selection:bg-emerald-900 selection:text-emerald-100">
            {logText}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>最新に更新</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ログ消去</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>コピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>ログをコピー</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
