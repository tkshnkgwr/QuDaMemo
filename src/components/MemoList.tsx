import React from 'react';
import { QuickMemo, SearchFilter } from '../types';
import { HighlightText } from './HighlightText';
import { downloadMarkdownFile } from '../utils/storage';
import {
  FileText,
  Calendar,
  Tag,
  Sparkles,
  Download,
  Trash2,
  ExternalLink,
  Lock,
  Clock,
} from 'lucide-react';

interface MemoListProps {
  memos: QuickMemo[];
  filter: SearchFilter;
  onSelectMemo: (memo: QuickMemo) => void;
  onDeleteMemo: (memoId: string) => void;
  onOpenTodayMemo: () => void;
  summarizingMemoId?: string | null;
}

export const MemoList: React.FC<MemoListProps> = ({
  memos,
  filter,
  onSelectMemo,
  onDeleteMemo,
  onOpenTodayMemo,
  summarizingMemoId,
}) => {
  // フィルター処理の適用
  const filteredMemos = memos.filter((memo) => {
    // キーワード一致
    if (filter.keyword.trim()) {
      const q = filter.keyword.trim().toLowerCase();
      const matchContent = memo.content.toLowerCase().includes(q);
      const matchSummary = memo.aiSummary.toLowerCase().includes(q);
      const matchDate = memo.date.includes(q) || memo.id.includes(q);
      const matchTags = memo.frontmatter.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchSummary && !matchDate && !matchTags) {
        return false;
      }
    }

    // タグ一致
    if (filter.tag.trim()) {
      const tagQuery = filter.tag.trim().toLowerCase();
      const hasTag = memo.frontmatter.tags.some((t) => t.toLowerCase() === tagQuery);
      if (!hasTag) return false;
    }

    // 日付範囲一致
    if (filter.dateRange.start && memo.date < filter.dateRange.start) {
      return false;
    }
    if (filter.dateRange.end && memo.date > filter.dateRange.end) {
      return false;
    }

    return true;
  });

  // 日付の降順でソート
  const sortedMemos = [...filteredMemos].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* バックグラウンド要約中全体の通知バナー */}
        {summarizingMemoId && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span className="font-semibold">バックグラウンドで AI 要約を自動生成中です...</span>
            </div>
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">対象メモ: {summarizingMemoId}.md</span>
          </div>
        )}

        {/* 件数サマリー */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            全 <strong className="text-slate-800 dark:text-slate-200">{sortedMemos.length}</strong> 件のメモを表示中
            {filter.keyword && (
              <span className="ml-2 font-mono">
                (検索: "<span className="text-sky-600 dark:text-sky-400">{filter.keyword}</span>")
              </span>
            )}
          </span>
          <span className="text-[11px] font-mono">ファイル形式: YYYYMMDD.md</span>
        </div>

        {/* メモが存在しない場合の表示 */}
        {sortedMemos.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              該当するメモが見つかりませんでした
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              検索条件を変更するか、「本日のメモを開く」ボタンから新しい日のメモを作成してください。
            </p>
            <button
              onClick={onOpenTodayMemo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-xs transition"
            >
              本日のメモを作成/編集
            </button>
          </div>
        )}

        {/* メモのグリッドカード一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMemos.map((memo) => {
            const dateStr = memo.date;
            const weekday = memo.frontmatter.weekday;
            const holiday = memo.frontmatter.holiday;
            const filename = memo.filename;
            const isSummarizingThis = summarizingMemoId === memo.id;

            return (
              <div
                key={memo.id}
                onClick={() => onSelectMemo(memo)}
                className={`group bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                  isSummarizingThis
                    ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                }`}
              >
                {/* カードヘッダー */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        <HighlightText text={filename} highlight={filter.keyword} />
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">({weekday})</span>
                      {holiday && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          {holiday}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* タグ一覧 */}
                  {memo.frontmatter.tags && memo.frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-[11px]">
                      {memo.frontmatter.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                        >
                          #<HighlightText text={tag} highlight={filter.keyword || filter.tag} />
                        </span>
                      ))}
                    </div>
                  )}

                  {/* AI要約セクション（文字・アイコン除去＆生成中表示） */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {isSummarizingThis ? (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold py-0.5 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        <span>AI要約生成中...</span>
                      </div>
                    ) : (
                      <p className="line-clamp-2 leading-relaxed text-[11px]">
                        <HighlightText text={memo.aiSummary} highlight={filter.keyword} />
                      </p>
                    )}
                  </div>

                  {/* 本文スニペット */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-mono text-[11px]">
                    <HighlightText
                      text={memo.content.replace(/^#+ .*/, '').trim()}
                      highlight={filter.keyword}
                    />
                  </div>
                </div>

                {/* カードフッターのアクションボタン */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[10px] font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(memo.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => downloadMarkdownFile(memo)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                      title="Markdownファイル出力"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMemo(memo.id)}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                      title="メモを削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectMemo(memo)}
                      className="p-1.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition flex items-center gap-1 text-[11px] font-medium"
                    >
                      <span>編集</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
