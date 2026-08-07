import React from 'react';
import { AppSettings } from '../../types';
import { Folder } from 'lucide-react';
import { pickDirectory } from '../../utils/dialog';

interface GeneralTabProps {
  formData: AppSettings;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ formData, setFormData }) => {
  const handleBrowseFolder = async () => {
    const selected = await pickDirectory(formData.storagePath);
    if (selected) {
      setFormData((prev) => ({ ...prev, storagePath: selected }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 保存先フォルダ設定 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          ローカルメモ保存先フォルダ
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Markdownメモファイル（<code>YYYYMMDD.md</code>）が物理保存されるローカルディスク上のフォルダパスを指定します。
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.storagePath}
            onChange={(e) => setFormData((prev) => ({ ...prev, storagePath: e.target.value }))}
            placeholder="C:\Users\..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
          <button
            type="button"
            onClick={handleBrowseFolder}
            className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Folder className="w-4 h-4 text-sky-500" />
            参照...
          </button>
        </div>
      </div>

      {/* 2. ファイル命名規則 & 自動保存 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 命名ルール */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            ファイル命名パターン
          </label>
          <input
            type="text"
            value={formData.fileNameRule}
            onChange={(e) => setFormData((prev) => ({ ...prev, fileNameRule: e.target.value }))}
            placeholder="YYYYMMDD.md"
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
          <p className="text-xs text-slate-400">標準: <code>YYYYMMDD.md</code></p>
        </div>

        {/* 自動保存インターバル */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            自動保存のタイマー間隔（秒）
          </label>
          <input
            type="number"
            min={1}
            max={300}
            value={formData.autoSaveIntervalSeconds || 10}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value, 10) || 10);
              setFormData((prev) => ({ ...prev, autoSaveIntervalSeconds: val }));
            }}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
          <p className="text-xs text-slate-400">推奨: 5〜30秒 (デフォルト: 10秒)</p>
        </div>
      </div>

      {/* 3. デフォルトFrontmatterテンプレート */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          新規メモ作成時のデフォルト Frontmatter テンプレート
        </label>
        <textarea
          rows={5}
          value={formData.defaultFrontmatterTemplate}
          onChange={(e) => setFormData((prev) => ({ ...prev, defaultFrontmatterTemplate: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        />
        <p className="text-xs text-slate-400">
          利用可能変数: <code>{"{{date}}"}</code>, <code>{"{{weekday}}"}</code>, <code>{"{{holiday}}"}</code>
        </p>
      </div>
    </div>
  );
};
