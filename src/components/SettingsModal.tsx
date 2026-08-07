import React, { useState } from 'react';
import { AppSettings } from '../types';
import {
  Settings,
  Folder,
  Sparkles,
  Palette,
  Database,
  Calendar,
  X,
  Save,
  Check,
} from 'lucide-react';
import { GeneralTab } from './settings/GeneralTab';
import { AiTab } from './settings/AiTab';
import { ThemeTab } from './settings/ThemeTab';
import { BackupTab } from './settings/BackupTab';
import { HolidaysTab } from './settings/HolidaysTab';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
}

export type SettingsTabMode = 'general' | 'ai' | 'theme' | 'backup' | 'holidays';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<SettingsTabMode>('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 前回のAIテスト結果がある場合は復元
  const [testResult, setTestResult] = useState<any>(() => {
    if (settings.lastTestResult) {
      return {
        loading: false,
        testedAt: settings.lastTestResult.testedAt,
        apiTest: {
          success: settings.lastTestResult.apiSuccess,
          latency: settings.lastTestResult.apiLatency || 0,
          message: settings.lastTestResult.apiMessage,
        },
        urlTest: {
          success: settings.lastTestResult.urlSuccess,
          latency: settings.lastTestResult.urlLatency || 0,
          message: settings.lastTestResult.urlMessage,
        },
        hasCustomKey: Boolean(settings.geminiApiKey?.trim()),
        model: settings.geminiModel,
        baseUrl: settings.geminiBaseUrl,
      };
    }
    return null;
  });

  // 設定保存ハンドラー
  const handleSave = () => {
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl h-[580px] flex flex-col overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-500 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                アプリケーション設定
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                QuDaMemoの動作環境・ローカル物理保存先・AIモデルをカスタマイズします
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 状態ステータスメッセージ通知 */}
        {statusMessage && (
          <div className="bg-sky-500 text-white text-xs px-4 py-1.5 text-center font-medium animate-in fade-in shrink-0">
            {statusMessage}
          </div>
        )}

        {/* 2カラムボディコンテンツ */}
        <div className="flex-1 flex min-h-0">
          {/* 左側タブナビゲーション */}
          <div className="w-48 bg-slate-50/80 dark:bg-slate-900/60 p-3 border-r border-slate-200/80 dark:border-slate-800 space-y-1 shrink-0 overflow-y-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'general'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Folder className="w-4 h-4" />
              全般・保存先
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI 要約モデル
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'theme'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Palette className="w-4 h-4" />
              テーマ・表示
            </button>

            <button
              onClick={() => setActiveTab('holidays')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'holidays'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              カスタム祝日
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'backup'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              バックアップ・その他
            </button>
          </div>

          {/* 右側メイン設定タブコンテンツ */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <GeneralTab formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'ai' && (
              <AiTab
                formData={formData}
                setFormData={setFormData}
                showApiKey={showApiKey}
                setShowApiKey={setShowApiKey}
                testResult={testResult}
                setTestResult={setTestResult}
              />
            )}
            {activeTab === 'theme' && (
              <ThemeTab formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'holidays' && (
              <HolidaysTab formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'backup' && (
              <BackupTab
                formData={formData}
                setFormData={setFormData}
                setStatusMessage={setStatusMessage}
              />
            )}
          </div>
        </div>

        {/* モーダルツーフッター */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            設定変更は「保存して閉じる」をクリックするとローカルへ物理保存されます
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? '保存完了' : '設定を保存して閉じる'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
