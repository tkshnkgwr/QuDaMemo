import React from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Zap,
  FileText,
  Calendar,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';

interface AppOverviewModalProps {
  onClose: () => void;
}

export const AppOverviewModal: React.FC<AppOverviewModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">QuDaMemo 概要 ＆ 使い方ガイド</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                アプリの概念と基本的な操作方法
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Concept Section */}
          <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 space-y-2">
            <div className="font-bold text-sm text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>QuDaMemo（クダメモ）とは？</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              QuDaMemo は、<strong>「1日1ファイル」</strong>のシンプルな日録Markdownメモアプリです。
              ローカル保存先の物理 `.md` ファイルと直接同期し、外部サーバーへ勝手にデータを送信しない完全ローカルファースト設計となっています。
            </p>
          </div>

          {/* Main Features */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-500" />
              <span>主な機能と特徴</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  1日1メモ (YYYYMMDD.md)
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  複雑なフォルダ整理は不要。「本日のメモを開く」ボタンで即座にその日のノートを作成・編集できます。
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  月/週 カレンダービュー
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  月間・週間ビューで直感的に過去のログを把握。日本の祝日やカスタム休日も一目で確認できます。
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  AI自動要約 (Gemini連携)
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  メモ内容をバックグラウンドで自動AI要約。長文メモの概要を要約バッジとして一覧・カレンダーに表示します。
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  完全ローカルMarkdown保存
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  標準的なYAMLフロントマター付きMarkdown形式で指定フォルダに直保存されるため、他エディタとの親和性も最高です。
                </p>
              </div>
            </div>
          </div>

          {/* Usage Guide */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>基本的な使い方ガイド</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li>キーボードの <code>Ctrl + N</code> または「本日のメモを開く」をクリックしてエディタを開く。</li>
              <li>Markdown本文やタスク、タグ（例: <code>#仕事</code>）を入力（自動保存されます）。</li>
              <li>「閉じる＆一覧へ」をクリックすると、直前にいた画面（一覧・月カレンダー・週カレンダー）に戻る。</li>
              <li>環境設定 (<code>Ctrl + ,</code>) で保存先フォルダや祝日、AI要約モードをカスタマイズ。</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            理解しました
          </button>
        </div>
      </div>
    </div>
  );
};
