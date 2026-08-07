import React, { useState } from 'react';
import { AppSettings } from '../../types';
import { Calendar, Trash2 } from 'lucide-react';

interface HolidaysTabProps {
  formData: AppSettings;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const HolidaysTab: React.FC<HolidaysTabProps> = ({ formData, setFormData }) => {
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  // カスタム祝日の追加
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName.trim()) return;

    setFormData((prev) => ({
      ...prev,
      customHolidays: {
        ...(prev.customHolidays || {}),
        [newHolidayDate]: newHolidayName.trim(),
      },
    }));
    setNewHolidayDate('');
    setNewHolidayName('');
  };

  // カスタム祝日の削除
  const handleRemoveHoliday = (date: string) => {
    setFormData((prev) => {
      const updated = { ...(prev.customHolidays || {}) };
      delete updated[date];
      return {
        ...prev,
        customHolidays: updated,
      };
    });
  };

  const customHolidaysEntries = Object.entries(formData.customHolidays || {}).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div className="space-y-6">
      {/* 1. 新規カスタム祝日の追加フォーム */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          カスタム祝日・創立記念日・特別休日の追加
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          日本の国民の祝日に加え、会社創立記念日や個人的な記念日をカレンダー上に祝日・休日として赤色表示します。
        </p>

        <form onSubmit={handleAddHoliday} className="flex gap-2 pt-1">
          <input
            type="date"
            value={newHolidayDate}
            onChange={(e) => setNewHolidayDate(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            required
          />
          <input
            type="text"
            placeholder="祝日・イベント名（例: 創立記念日）"
            value={newHolidayName}
            onChange={(e) => setNewHolidayName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-sm"
          >
            追加する
          </button>
        </form>
      </div>

      {/* 2. 登録済みカスタム祝日一覧 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          登録済みカスタム祝日一覧 ({customHolidaysEntries.length} 件)
        </label>

        {customHolidaysEntries.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">登録されているカスタム祝日はありません。</p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {customHolidaysEntries.map(([date, name]) => (
              <div
                key={date}
                className="flex items-center justify-between p-2 bg-white dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500 dark:text-slate-400 font-medium">{date}</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveHoliday(date)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
