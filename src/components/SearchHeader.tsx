import React from 'react';
import { ActiveViewMode, SearchFilter } from '../types';
import { Search, List, Calendar, CalendarDays, Plus, Tag, X, Calendar as CalendarIcon, FilterX, HelpCircle } from 'lucide-react';

interface SearchHeaderProps {
  viewMode: ActiveViewMode;
  onSelectViewMode: (mode: ActiveViewMode) => void;
  filter: SearchFilter;
  onUpdateFilter: (newFilter: SearchFilter) => void;
  onOpenTodayMemo: () => void;
  onOpenShortcuts?: () => void;
  availableTags: string[];
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  viewMode,
  onSelectViewMode,
  filter,
  onUpdateFilter,
  onOpenTodayMemo,
  onOpenShortcuts,
  availableTags,
}) => {
  const hasActiveFilter =
    filter.keyword.trim() !== '' ||
    filter.tag.trim() !== '' ||
    filter.dateRange.start !== '' ||
    filter.dateRange.end !== '';

  const clearFilters = () => {
    onUpdateFilter({
      keyword: '',
      tag: '',
      dateRange: { start: '', end: '' },
    });
  };

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* ビュー切替タブ */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800 self-start">
          <button
            onClick={() => onSelectViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            通常一覧
          </button>
          <button
            onClick={() => onSelectViewMode('calendar_month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'calendar_month'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            カレンダー(月)
          </button>
          <button
            onClick={() => onSelectViewMode('calendar_week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'calendar_week'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            カレンダー(週)
          </button>
        </div>

        {/* アクションボタン: 本日のメモを開く & ショートカットヘルプ */}
        <div className="flex items-center gap-2">
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="キーボードショートカット確認 (F1)"
            >
              <HelpCircle className="w-4 h-4 text-sky-500" />
              <span className="hidden sm:inline">ヘルプ</span>
            </button>
          )}
          <button
            onClick={onOpenTodayMemo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>本日のメモを開く</span>
          </button>
        </div>
      </div>

      {/* 検索・フィルターバー */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs">
        {/* キーワード検索入力 */}
        <div className="relative md:col-span-5">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="キーワード検索 (本文・要約・タイトル)..."
            value={filter.keyword}
            onChange={(e) => onUpdateFilter({ ...filter, keyword: e.target.value })}
            className="w-full pl-8 pr-7 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
          />
          {filter.keyword && (
            <button
              onClick={() => onUpdateFilter({ ...filter, keyword: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* タグ選択ドロップダウン */}
        <div className="relative md:col-span-3">
          <div className="flex items-center">
            <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filter.tag}
              onChange={(e) => onUpdateFilter({ ...filter, tag: e.target.value })}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 appearance-none"
            >
              <option value="">すべてのタグ</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 日付フィルター */}
        <div className="flex items-center gap-1 md:col-span-3">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="date"
            value={filter.dateRange.start}
            onChange={(e) =>
              onUpdateFilter({
                ...filter,
                dateRange: { ...filter.dateRange, start: e.target.value },
              })
            }
            className="w-full px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
          />
          <span className="text-slate-400 text-[11px]">~</span>
          <input
            type="date"
            value={filter.dateRange.end}
            onChange={(e) =>
              onUpdateFilter({
                ...filter,
                dateRange: { ...filter.dateRange, end: e.target.value },
              })
            }
            className="w-full px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] focus:outline-hidden focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        {/* フィルター解除ボタン */}
        {hasActiveFilter && (
          <div className="md:col-span-1 flex items-center justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition"
              title="検索条件を解除"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span className="sr-only">クリア</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
