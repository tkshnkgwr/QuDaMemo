import React, { useState } from 'react';
import { QuickMemo, SearchFilter } from '../types';
import { getJapaneseHolidays, getJapaneseWeekday } from '../utils/holidays';
import { HighlightText } from './HighlightText';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
} from 'lucide-react';

interface CalendarViewProps {
  memos: QuickMemo[];
  filter: SearchFilter;
  calendarStartDay?: 'monday' | 'sunday';
  viewType?: 'month' | 'week';
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  memos,
  filter,
  calendarStartDay = 'monday',
  viewType = 'month',
  onSelectDate,
}) => {
  const today = new Date();

  // 月表示用の状態（年および1から始まる月）
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);

  // 週表示用の状態（アクティブな週の基準日）
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(today);

  // ツールチップ用ホバー状態
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    holidayName: string | null;
    memo: QuickMemo | null;
    x: number;
    y: number;
  } | null>(null);

  const isSundayStart = calendarStartDay === 'sunday';
  const isWeekView = viewType === 'week';

  // 月表示用のナビゲーションハンドラー
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleTodayMonth = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  // 週表示用のナビゲーションハンドラー
  const handlePrevWeek = () => {
    setCurrentWeekDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleTodayWeek = () => {
    setCurrentWeekDate(new Date());
  };

  /**
   * 6行（42日間）の月間カレンダーグリッドを作成
   */
  const buildMonthGrid = () => {
    const holidaysMap = getJapaneseHolidays(currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = 日曜日, 1 = 月曜日 ... 6 = 土曜日

    let prevMonthOffset = 0;
    if (isSundayStart) {
      prevMonthOffset = dayOfWeek;
    } else {
      const monIndex = dayOfWeek === 0 ? 7 : dayOfWeek; // 1 = 月曜日 ... 7 = 日曜日
      prevMonthOffset = monIndex - 1;
    }

    const startDate = new Date(currentYear, currentMonth - 1, 1 - prevMonthOffset);

    const grid = [];
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);

      const yyyy = cellDate.getFullYear();
      const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
      const dd = String(cellDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const idStr = `${yyyy}${mm}${dd}`;

      const isCurrentMonth = cellDate.getMonth() + 1 === currentMonth;
      const isToday = dateStr === today.toISOString().slice(0, 10);
      const holidayName = holidaysMap[dateStr] || null;

      const memo = memos.find((m) => m.id === idStr || m.date === dateStr) || null;

      let isSearchMatch = false;
      if (memo && filter.keyword.trim()) {
        const q = filter.keyword.trim().toLowerCase();
        isSearchMatch =
          memo.content.toLowerCase().includes(q) ||
          memo.aiSummary.toLowerCase().includes(q) ||
          memo.frontmatter.tags.some((t) => t.toLowerCase().includes(q));
      } else if (memo && filter.tag.trim()) {
        isSearchMatch = memo.frontmatter.tags.some(
          (t) => t.toLowerCase() === filter.tag.trim().toLowerCase()
        );
      }

      grid.push({
        dateObj: cellDate,
        dateStr,
        idStr,
        dayNum: cellDate.getDate(),
        isCurrentMonth,
        isToday,
        holidayName,
        memo,
        isSearchMatch,
      });
    }

    return grid;
  };

  /**
   * 1週間（7日間）の週間カレンダーグリッドを作成
   */
  const buildWeekGrid = () => {
    const dayOfWeek = currentWeekDate.getDay();
    let offset = 0;
    if (isSundayStart) {
      offset = dayOfWeek;
    } else {
      offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    }

    const startDate = new Date(currentWeekDate);
    startDate.setDate(currentWeekDate.getDate() - offset);

    const grid = [];
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);

      const yyyy = cellDate.getFullYear();
      const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
      const dd = String(cellDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const idStr = `${yyyy}${mm}${dd}`;

      const holidaysMap = getJapaneseHolidays(cellDate.getFullYear());
      const holidayName = holidaysMap[dateStr] || null;
      const isToday = dateStr === today.toISOString().slice(0, 10);
      const isCurrentMonth = true;

      const memo = memos.find((m) => m.id === idStr || m.date === dateStr) || null;

      let isSearchMatch = false;
      if (memo && filter.keyword.trim()) {
        const q = filter.keyword.trim().toLowerCase();
        isSearchMatch =
          memo.content.toLowerCase().includes(q) ||
          memo.aiSummary.toLowerCase().includes(q) ||
          memo.frontmatter.tags.some((t) => t.toLowerCase().includes(q));
      } else if (memo && filter.tag.trim()) {
        isSearchMatch = memo.frontmatter.tags.some(
          (t) => t.toLowerCase() === filter.tag.trim().toLowerCase()
        );
      }

      grid.push({
        dateObj: cellDate,
        dateStr,
        idStr,
        dayNum: cellDate.getDate(),
        isCurrentMonth,
        isToday,
        holidayName,
        memo,
        isSearchMatch,
      });
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return { grid, startDate, endDate };
  };

  const monthGrid = buildMonthGrid();
  const weekData = buildWeekGrid();

  const formatWeekHeader = () => {
    const s = weekData.startDate;
    const e = weekData.endDate;
    const sY = s.getFullYear();
    const sM = s.getMonth() + 1;
    const sD = s.getDate();
    const eY = e.getFullYear();
    const eM = e.getMonth() + 1;
    const eD = e.getDate();

    if (sY !== eY) {
      return `${sY}年${sM}月${sD}日 〜 ${eY}年${eM}月${eD}日`;
    }
    if (sM !== eM) {
      return `${sY}年 ${sM}月${sD}日 〜 ${eM}月${eD}日`;
    }
    return `${sY}年 ${sM}月${sD}日 〜 ${eD}日`;
  };

  const dayHeaders = isSundayStart
    ? [
        { name: '日', isSunday: true, isSaturday: false },
        { name: '月', isSunday: false, isSaturday: false },
        { name: '火', isSunday: false, isSaturday: false },
        { name: '水', isSunday: false, isSaturday: false },
        { name: '木', isSunday: false, isSaturday: false },
        { name: '金', isSunday: false, isSaturday: false },
        { name: '土', isSunday: false, isSaturday: true },
      ]
    : [
        { name: '月', isSunday: false, isSaturday: false },
        { name: '火', isSunday: false, isSaturday: false },
        { name: '水', isSunday: false, isSaturday: false },
        { name: '木', isSunday: false, isSaturday: false },
        { name: '金', isSunday: false, isSaturday: false },
        { name: '土', isSunday: false, isSaturday: true },
        { name: '日', isSunday: true, isSaturday: false },
      ];

  const activeGrid = isWeekView ? weekData.grid : monthGrid;

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40 flex flex-col">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col space-y-3">
        {/* カレンダーナビゲーションヘッダー */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-sky-500" />
              <span>
                {isWeekView ? formatWeekHeader() : `${currentYear}年 ${currentMonth}月`}
              </span>
            </h2>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={isWeekView ? handlePrevWeek : handlePrevMonth}
                className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                title={isWeekView ? '前週' : '前月'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={isWeekView ? handleTodayWeek : handleTodayMonth}
                className="px-2.5 py-0.5 rounded text-xs font-medium hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                今{isWeekView ? '週' : '日'}
              </button>
              <button
                onClick={isWeekView ? handleNextWeek : handleNextMonth}
                className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                title={isWeekView ? '次週' : '次月'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              祝日 (赤色)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              メモあり
            </span>
            <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {isSundayStart ? '日曜始まり' : '月曜始まり'} / {isWeekView ? '1週間表示' : '月間'}
            </span>
          </div>
        </div>

        {/* カレンダーコンテナ */}
        {isWeekView ? (
          /* 縦並びの1週間表示 */
          <div className="space-y-2.5 pb-4">
            {weekData.grid.map((cell) => {
              const isSunday = cell.dateObj.getDay() === 0;
              const isSaturday = cell.dateObj.getDay() === 6;
              const isHoliday = Boolean(cell.holidayName);

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => onSelectDate(cell.dateStr)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredCell({
                      dateStr: cell.dateStr,
                      holidayName: cell.holidayName,
                      memo: cell.memo,
                      x: rect.left,
                      y: rect.bottom + window.scrollY,
                    });
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`bg-white dark:bg-slate-900 rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3 transition-all cursor-pointer group shadow-2xs hover:shadow-md ${
                    cell.isToday
                      ? 'ring-2 ring-sky-500 border-sky-300 dark:border-sky-800 bg-sky-50/30 dark:bg-sky-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                  } ${
                    cell.isSearchMatch
                      ? 'bg-amber-100/60 dark:bg-amber-950/40 ring-2 ring-amber-400'
                      : ''
                  }`}
                >
                  {/* 左カラム: 日付と曜日バッジ */}
                  <div className="sm:w-48 shrink-0 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-1.5 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800/80 pb-2 sm:pb-0 sm:pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold font-mono px-2 py-1 rounded-md ${
                          cell.isToday
                            ? 'bg-sky-600 text-white shadow-xs'
                            : isHoliday || isSunday
                            ? 'text-rose-600 dark:text-rose-400 font-extrabold bg-rose-50 dark:bg-rose-950/50'
                            : isSaturday
                            ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                            : 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {cell.dateObj.getMonth() + 1}/{cell.dayNum} ({getJapaneseWeekday(cell.dateStr)})
                      </span>
                      {cell.isToday && (
                        <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/60 px-1.5 py-0.5 rounded">
                          今日
                        </span>
                      )}
                    </div>

                    {isHoliday && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500 text-white shadow-xs leading-none">
                        {cell.holidayName}
                      </span>
                    )}
                  </div>

                  {/* 右カラム: AI要約とタグ */}
                  <div className="flex-1 min-w-0">
                    {cell.memo ? (
                      <div className="space-y-2">
                        <div className="bg-sky-50/90 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/80 rounded-lg p-3 shadow-2xs group-hover:border-sky-300 transition">
                          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 mb-1">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              AI要約
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 font-normal">
                              {cell.memo.filename}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                            <HighlightText
                              text={cell.memo.aiSummary}
                              highlight={filter.keyword}
                            />
                          </p>
                        </div>

                        {cell.memo.frontmatter.tags && cell.memo.frontmatter.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {cell.memo.frontmatter.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-2 px-3.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-slate-400 group-hover:text-sky-500 group-hover:border-sky-300 dark:group-hover:border-sky-800 transition bg-slate-50/30 dark:bg-slate-950/20">
                        <span className="text-xs font-medium">この日のメモは未作成です</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-md border border-sky-200 dark:border-sky-800">
                          <Plus className="w-3.5 h-3.5" />
                          メモを作成
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 月間グリッド表示 */
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex-1 flex flex-col">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-center text-xs font-bold py-2">
              {dayHeaders.map((header, idx) => (
                <div
                  key={idx}
                  className={`py-0.5 ${
                    header.isSunday
                      ? 'text-rose-600 dark:text-rose-400'
                      : header.isSaturday
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {header.name}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-[500px] divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
              {monthGrid.map((cell) => {
                const isSunday = cell.dateObj.getDay() === 0;
                const isSaturday = cell.dateObj.getDay() === 6;
                const isHoliday = Boolean(cell.holidayName);

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => onSelectDate(cell.dateStr)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredCell({
                        dateStr: cell.dateStr,
                        holidayName: cell.holidayName,
                        memo: cell.memo,
                        x: rect.left,
                        y: rect.bottom + window.scrollY,
                      });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`relative p-2 flex flex-col justify-between transition-all cursor-pointer group ${
                      !cell.isCurrentMonth
                        ? 'bg-slate-50/50 dark:bg-slate-950/40 opacity-40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    } ${
                      cell.isToday
                        ? 'ring-2 ring-sky-500 ring-inset bg-sky-50/30 dark:bg-sky-950/20'
                        : ''
                    } ${
                      cell.isSearchMatch
                        ? 'bg-amber-100/60 dark:bg-amber-950/40 ring-2 ring-amber-400 ring-inset'
                        : ''
                    }`}
                  >
                    {/* 上部行: 日付数値と赤色の祝日ラベル */}
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                          cell.isToday
                            ? 'bg-sky-600 text-white shadow-xs'
                            : isHoliday || isSunday
                            ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                            : isSaturday
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {/* 赤色祝日バッジ */}
                      {isHoliday && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white shadow-xs leading-none max-w-[80px] truncate">
                          {cell.holidayName}
                        </span>
                      )}
                    </div>

                    {/* 中央コンテンツ: AI要約のみ */}
                    <div className="my-1 flex-1 flex flex-col justify-start overflow-hidden">
                      {cell.memo ? (
                        <div className="bg-sky-50/90 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/80 rounded p-1.5 shadow-2xs group-hover:border-sky-400 transition">
                          <p className="text-[10px] text-slate-700 dark:text-slate-200 leading-tight font-medium line-clamp-3">
                            <HighlightText
                              text={cell.memo.aiSummary}
                              highlight={filter.keyword}
                            />
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-60 group-hover:opacity-100 py-2 transition">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-sky-500 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                            <Plus className="w-3 h-3" />
                            メモを作成
                          </span>
                        </div>
                      )}
                    </div>

                    {/* フッター: タグ表示 */}
                    {cell.memo && cell.memo.frontmatter.tags && cell.memo.frontmatter.tags.length > 0 && (
                      <div className="flex items-center gap-1 overflow-hidden flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/80">
                        {cell.memo.frontmatter.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 truncate max-w-[80px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* カーソルホバー用ツールチップ / ポップオーバー */}
      {hoveredCell && (hoveredCell.holidayName || hoveredCell.memo) && (
        <div
          className="fixed z-50 pointer-events-none w-72 bg-slate-900 text-slate-100 rounded-xl p-3 shadow-2xl border border-slate-700 text-xs space-y-2 animate-in fade-in duration-150"
          style={{
            top: Math.min(hoveredCell.y + 8, window.innerHeight - 200),
            left: Math.min(hoveredCell.x + 8, window.innerWidth - 300),
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="font-mono font-bold text-sky-400 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              {hoveredCell.dateStr} ({getJapaneseWeekday(hoveredCell.dateStr)})
            </div>

            {hoveredCell.holidayName && (
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                祝日: {hoveredCell.holidayName}
              </span>
            )}
          </div>

          {hoveredCell.memo ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono font-semibold text-slate-300">
                  {hoveredCell.memo.filename}
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3 h-3" />
                  AI要約
                </span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                {hoveredCell.memo.aiSummary}
              </p>

              {hoveredCell.memo.frontmatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {hoveredCell.memo.frontmatter.tags.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-[11px] italic">
              （この日のメモはまだ作成されていません。クリックして新規作成）
            </p>
          )}
        </div>
      )}
    </div>
  );
};
