import React from 'react';
import { version } from '../../package.json';
import { FileText, X, Cpu, ShieldCheck, Heart } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xl ring-4 ring-sky-500/20">
            <FileText className="w-9 h-9" />
          </div>

          {/* Title & Version */}
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              QuDaMemo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Quick Daily Memo • v{version}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
            1日1ファイルの厳密な制約とカレンダービュー、AI自動要約エンジンを統合した超軽量・高速デスクメモアプリケーション。
          </p>

          {/* Tech Badges */}
          <div className="w-full pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Cpu className="w-3.5 h-3.5 text-sky-500" />
                コアエンジン
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Tauri v2 + Rust
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                フロントエンド
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                React 19 + TypeScript
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Bos
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-colors cursor-pointer mt-2"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
