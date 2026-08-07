import React from 'react';
import { AppSettings } from '../../types';
import { Palette, Sun, Moon, Monitor, Calendar } from 'lucide-react';

interface ThemeTabProps {
  formData: AppSettings;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const ThemeTab: React.FC<ThemeTabProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      {/* 1. カラーテーマ選択 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-sky-500" />
          カラーテーマモード
        </label>

        <div className="grid grid-cols-3 gap-3">
          {/* ライトモード */}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, theme: 'light' }))}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              formData.theme === 'light'
                ? 'bg-white border-sky-500 text-sky-600 shadow-sm ring-2 ring-sky-500/20'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-semibold">ライトモード</span>
          </button>

          {/* ダークモード */}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, theme: 'dark' }))}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              formData.theme === 'dark'
                ? 'bg-slate-900 border-sky-500 text-sky-400 shadow-sm ring-2 ring-sky-500/20'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold">ダークモード</span>
          </button>

          {/* OS連動 */}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, theme: 'system' }))}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              formData.theme === 'system'
                ? 'bg-white dark:bg-slate-900 border-sky-500 text-sky-500 shadow-sm ring-2 ring-sky-500/20'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Monitor className="w-5 h-5 text-slate-500" />
            <span className="text-xs font-semibold">OS設定に連動</span>
          </button>
        </div>
      </div>

      {/* 2. カレンダー開始曜日 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          カレンダービューの週開始曜日
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="calendarStartDay"
              value="monday"
              checked={formData.calendarStartDay === 'monday'}
              onChange={() => setFormData((prev) => ({ ...prev, calendarStartDay: 'monday' }))}
              className="text-sky-500 focus:ring-sky-500"
            />
            月曜日から開始（ビジネス仕様）
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="calendarStartDay"
              value="sunday"
              checked={formData.calendarStartDay === 'sunday'}
              onChange={() => setFormData((prev) => ({ ...prev, calendarStartDay: 'sunday' }))}
              className="text-sky-500 focus:ring-sky-500"
            />
            日曜日から開始（標準仕様）
          </label>
        </div>
      </div>
    </div>
  );
};
