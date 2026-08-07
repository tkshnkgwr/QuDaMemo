import React, { useRef } from 'react';
import { AppSettings } from '../../types';
import { Download, Upload, Trash2, Database, AlertCircle } from 'lucide-react';
import { exportFileWithDialog } from '../../utils/dialog';
import { clearLocalStorageCache } from '../../utils/storage';
import { logger } from '../../utils/logger';

interface BackupTabProps {
  formData: AppSettings;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
  setStatusMessage: (msg: string | null) => void;
}

export const BackupTab: React.FC<BackupTabProps> = ({ formData, setFormData, setStatusMessage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 設定エクスポート
  const handleExportConfig = async () => {
    const jsonStr = JSON.stringify(formData, null, 2);
    const success = await exportFileWithDialog(jsonStr, 'qudamemo_config.json', 'JSON (*.json)');
    if (success) {
      setStatusMessage('設定ファイルを正常にエクスポートしました');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // 設定インポート
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setFormData((prev) => ({ ...prev, ...imported }));
        setStatusMessage('設定ファイルを正常にインポートしました');
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err) {
        logger.error('設定ファイルインポート失敗', err);
        alert('設定ファイルの読み込みに失敗しました。ファイルフォーマットを確認してください。');
      }
    };
    reader.readAsText(file);
  };

  // LocalStorage 一時キャッシュクリア
  const handleClearCache = () => {
    if (confirm('ブラウザ内の一時表示用キャッシュ (LocalStorage) をクリアしますか？\n（指定されたローカル保存先フォルダ内の物理 Markdown メモファイルは削除されず安全に保護されます）')) {
      clearLocalStorageCache();
      setStatusMessage('LocalStorageキャッシュを消去しました。');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 設定のインポート・エクスポート */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          QuDaMemo アプリ設定データのバックアップ ＆ 復元
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          アプリの設定情報（保存先パス、Gemini APIキー、プロンプト等）を JSON ファイルとして保存・読み込みします。
        </p>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportConfig}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            設定ファイルのエクスポート
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-sky-500" />
            設定ファイルのインポート...
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* 2. LocalStorage 一時キャッシュクリア */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-500" />
          一時表示用キャッシュ (LocalStorage) の全削除
        </label>

        {/* 安全注意事項カード */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">【安心設計】実ファイルは削除されません</span>
            <p className="mt-0.5 text-[11px] opacity-90">
              LocalStorage はUI表示を高速化するための一時キャッシュです。全削除しても、物理ローカルディスク（<code>{formData.storagePath}</code>）に保存された <code>.md</code> ファイルは安全に保護されます。
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearCache}
          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          LocalStorage 一時キャッシュをクリアする
        </button>
      </div>
    </div>
  );
};
