import React, { useState, useRef } from 'react';
import { AppSettings } from '../types';
import { pickDirectory, exportFileWithDialog } from '../utils/dialog';
import { clearLocalStorageCache } from '../utils/storage';
import { logger } from '../utils/logger';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { version } from '../../package.json';
import {
  Settings,
  Folder,
  Key,
  Eye,
  EyeOff,
  Cloud,
  FileCode,
  Moon,
  Sun,
  X,
  Save,
  Sparkles,
  Calendar,
  Palette,
  Monitor,
  Download,
  Upload,
  Cpu,
  Activity,
  AlertCircle,
  Check,
  Globe,
  Sliders,
  FileText,
  Trash2,
  Database,
} from 'lucide-react';

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await tauriFetch(url, options as any);
  } catch (err) {
    return await window.fetch(url, options);
  }
}

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
}

export type SettingsTabMode = 'general' | 'ai' | 'theme' | 'other';

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
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UPDATE [2026-08-03]: AI接続テスト用ステート (前回の保存されたテスト結果があれば初期復元)
  const [testResult, setTestResult] = useState<{
    loading: boolean;
    testedAt?: string;
    apiTest?: {
      success: boolean;
      latency: number;
      message: string;
    };
    urlTest?: {
      success: boolean;
      latency: number;
      message: string;
    };
    hasCustomKey?: boolean;
    model?: string;
    baseUrl?: string;
  } | null>(() => {
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

  // フォルダ選択ダイアログ呼び出しハンドラー
  const handleBrowseFolder = async () => {
    const selected = await pickDirectory(formData.storagePath);
    if (selected) {
      setFormData((prev) => ({ ...prev, storagePath: selected }));
    }
  };

  // 現在日時を "YYYY-MM-DD HH:mm:ss" 形式で取得するヘルパー
  const getFormattedNow = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  // AI接続テストの実行関数 (APIキー未設定ガード & 日時付き結果上書き保存)
  const handleTestConnection = async () => {
    const apiKey = formData.geminiApiKey?.trim();
    const model = formData.geminiModel || 'gemini-3.6-flash';
    const baseUrl = (formData.geminiBaseUrl?.trim() || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
    const testedAt = getFormattedNow();

    // 0. APIキーが未入力の場合は外部リクエストを行わず警告表示してスキップ
    if (!apiKey) {
      const warningMsg = '⚠️ APIキーが未設定です。Gemini AI要約をご利用いただくにはAPIキーを入力してください。';
      const noKeyResult = {
        loading: false,
        testedAt,
        apiTest: {
          success: false,
          latency: 0,
          message: warningMsg,
        },
        urlTest: {
          success: false,
          latency: 0,
          message: '⚠️ APIキーが未設定のため接続テストを行いませんでした。',
        },
        hasCustomKey: false,
        model,
        baseUrl,
      };

      setTestResult(noKeyResult);
      setFormData((prev) => ({
        ...prev,
        lastTestResult: {
          testedAt,
          apiSuccess: false,
          apiMessage: warningMsg,
          urlSuccess: false,
          urlMessage: '⚠️ APIキー未設定のためテストスキップ',
        },
      }));
      return;
    }

    setTestResult({ loading: true });

    // 1. エンドポイント Web/URL 接続テスト (APIキー不要の HTTP 疎通チェック)
    const urlTestPromise = (async () => {
      const start = performance.now();
      try {
        const res = await safeFetch(baseUrl, { method: 'HEAD', mode: 'no-cors' }).catch(() => null)
          || await safeFetch(baseUrl, { method: 'GET' }).catch(() => null);
        const latency = Math.round(performance.now() - start);
        if (res) {
          return {
            success: true,
            latency,
            message: `🟢 【Web/URL接続成功 (${latency}ms)】 エンドポイント URL (${baseUrl}) への HTTP 疎通を確認しました。`,
          };
        }
        return {
          success: false,
          latency,
          message: `🔴 【Web/URL接続不可】 エンドポイント URL (${baseUrl}) へのアクセスに失敗しました。`,
        };
      } catch (err: any) {
        const latency = Math.round(performance.now() - start);
        return {
          success: false,
          latency,
          message: `🔴 【Web/URL接続エラー (${latency}ms)】 ${err?.message || 'ネットワークエラーが発生しました。'}`,
        };
      }
    })();

    // 2. Gemini API 要約接続テスト (APIキー + モデルでの要約応答疎通チェック)
    const apiTestPromise = (async () => {
      const start = performance.now();
      try {
        const testEndpoint = `${baseUrl}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await safeFetch(testEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Reply with exact text: "OK"' }] }],
          }),
        });
        const latency = Math.round(performance.now() - start);

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
          return {
            success: true,
            latency,
            message: `🟢 【API要約接続成功 (${latency}ms)】 Geminiモデル (${model}) のAI要約エンジンと正常に疎通・応答を確認しました。(応答: "${text.slice(0, 30)}")`,
          };
        } else {
          const errText = await res.text().catch(() => '');
          return {
            success: false,
            latency,
            message: `🔴 【API要約接続失敗 (HTTP ${res.status})】 指定された Base URL / APIキーでの通信が拒否されました。(詳細: ${errText.slice(0, 80) || res.statusText})`,
          };
        }
      } catch (err: any) {
        const latency = Math.round(performance.now() - start);
        return {
          success: false,
          latency,
          message: `🔴 【API要約接続例外エラー (${latency}ms)】 ${err?.message || '通信エラーが発生しました。'}`,
        };
      }
    })();

    const [urlResult, apiResult] = await Promise.all([urlTestPromise, apiTestPromise]);

    logger.info(`AI接続テスト完了 (${testedAt}): API=${apiResult.success ? 'OK' : 'FAIL'}, URL=${urlResult.success ? 'OK' : 'FAIL'}`);

    const newTestState = {
      loading: false,
      testedAt,
      apiTest: apiResult,
      urlTest: urlResult,
      hasCustomKey: Boolean(apiKey),
      model,
      baseUrl,
    };

    setTestResult(newTestState);

    // 最新のテスト結果と実行日時を formData に上書き保存
    setFormData((prev) => ({
      ...prev,
      lastTestResult: {
        testedAt,
        apiSuccess: apiResult.success,
        apiMessage: apiResult.message,
        apiLatency: apiResult.latency,
        urlSuccess: urlResult.success,
        urlMessage: urlResult.message,
        urlLatency: urlResult.latency,
      },
    }));
  };

  const handleSave = () => {
    logger.info(`アプリ設定を保存・更新しました: storagePath=${formData.storagePath}`);
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  // 設定(config.json)のエクスポート
  const handleExportConfig = async () => {
    try {
      const jsonStr = JSON.stringify(formData, null, 2);
      const success = await exportFileWithDialog(
        'qudamemo_config.json',
        jsonStr,
        'application/json'
      );
      if (success) {
        setStatusMessage('設定 (config.json) をエクスポートしました');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      setStatusMessage('エクスポートに失敗しました');
    }
  };

  // 設定(config.json)のインポート
  const handleImportConfigClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (typeof imported === 'object' && imported !== null) {
          setFormData((prev) => ({
            ...prev,
            ...imported,
          }));
          setStatusMessage('設定を読み込みました。保存して閉じるを押してください。');
          setTimeout(() => setStatusMessage(null), 4000);
        }
      } catch {
        alert('設定ファイルの読み込みに失敗しました。正しいJSON形式か確認してください。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[580px] max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">環境設定 (App Settings)</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                アプリの動作、保存先、AI要約エンジン、カラーテーマの設定
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

        {/* 2カラム構成のメインレイアウト */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左サイドバー: カテゴリ切り替えメニュー */}
          <div className="w-52 border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3 space-y-1 shrink-0 select-none">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span>全般 (General)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span>AI・要約 (AI Mode)</span>
              </div>
              {formData.geminiApiKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>テーマ (Theme)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('other')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                activeTab === 'other'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>その他 (Backup)</span>
            </button>
          </div>

          {/* 右メインエリア: 選択されたタブのコンテンツ */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. 全般 (General) */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-sky-500" />
                    <span>ファイルストレージ・基本設定</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    メモの物理 Markdown 保存場所やファイル命名ルールの設定
                  </p>
                </div>

                {/* ローカルの保存フォルダ参照 */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>ローカル保存先フォルダ (Storage Path)</span>
                    <span className="text-rose-500 font-bold text-sm ml-0.5">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.storagePath}
                      onChange={(e) => setFormData({ ...formData, storagePath: e.target.value })}
                      placeholder="例: C:\Users\YourName\Documents\QuDaMemo\notes"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleBrowseFolder}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Folder className="w-4 h-4 text-sky-500" />
                      <span>参照...</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    指定されたローカルディレクトリへ実際の物理 `.md` ファイルが保存・同期されます。
                  </p>
                </div>

                {/* ファイル名の命名ルール */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <FileCode className="w-4 h-4 text-sky-500" />
                    <span>ファイル名の命名ルール (Filename Template)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fileNameRule || 'YYYYMMDD.md'}
                    onChange={(e) => setFormData({ ...formData, fileNameRule: e.target.value })}
                    placeholder="YYYYMMDD.md"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    デフォルト: `YYYYMMDD.md` （例: 20260803.md）
                  </p>
                </div>

                {/* カレンダー開始曜日 */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span>カレンダーの開始曜日 (Start Day of Week)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, calendarStartDay: 'monday' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        formData.calendarStartDay === 'monday'
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      月曜日から始まる (Monday)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, calendarStartDay: 'sunday' })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        formData.calendarStartDay === 'sunday'
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      日曜日から始まる (Sunday)
                    </button>
                  </div>
                </div>

                {/* UPDATE [2026-08-03]: 自動保存までのタイマー秒数設定 (デフォルト10秒・0設定不可) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-500" />
                    <span>自動保存タイミング (Auto-Save Delay)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={formData.autoSaveIntervalSeconds ?? 10}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const safeVal = isNaN(val) || val < 1 ? 1 : val;
                        setFormData({ ...formData, autoSaveIntervalSeconds: safeVal });
                      }}
                      className="w-32 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">秒後 (Seconds)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    タイピングを停止してから自動保存が実行されるまでの秒数を指定します。（デフォルト: 10秒 / 0秒は設定できません）
                  </p>
                </div>
              </div>
            )}

            {/* 2. AI (AI & Summarization) */}
            {activeTab === 'ai' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI要約 ＆ Gemini 接続設定</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Google Gemini API キー、カスタム Base URL、AIモデル、要約方式の選択
                  </p>
                </div>

                {/* APIキー必須要件およびアクセス選択役割の案内注記 */}
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 font-medium space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Gemini AI 要約のご利用には Gemini API キーが必須です</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                    ※ Google AI Studio 等で発行した API キーを設定してください。設定された API キーを用いて『API直通方式』または『Web/プロキシ中継方式』のどちらで通信するかを選択できます。
                  </p>
                </div>

                {/* Gemini API Key */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-500" />
                      <span>Gemini API Key</span>
                      <span className="text-rose-500 font-bold text-sm ml-0.5">*</span>
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">Google AI Studio で無料発行可能</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="AI Studio / Gemini API Key を入力 (例: AIzaSy...)"
                      value={formData.geminiApiKey}
                      onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Gemini エンドポイント URL (Base URL) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-sky-500" />
                    <span>Gemini エンドポイント URL (Base URL)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.geminiBaseUrl || ''}
                    onChange={(e) => setFormData({ ...formData, geminiBaseUrl: e.target.value })}
                    placeholder="https://generativelanguage.googleapis.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    社内プロキシやカスタムプロキシ環境の場合は中継URLを指定してください。（通常は空欄のままで自動的に公式URLが使用されます）
                  </p>
                </div>

                {/* 使用AIモデル選択 */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-sky-500" />
                    <span>使用AIモデル (AI Model Selection)</span>
                  </label>
                  <select
                    required
                    value={formData.geminiModel || 'gemini-3.6-flash'}
                    onChange={(e) => setFormData({ ...formData, geminiModel: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-sans text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="gemini-3.6-flash">Google Gemini 3.6 Flash（最新・超高速・要約に最適）</option>
                    <option value="gemini-3.6-pro">Google Gemini 3.6 Pro（最新・最高精度）</option>
                    <option value="gemini-3.1-flash">Google Gemini 3.1 Flash（バランス型）</option>
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash（スタンダード高速）</option>
                    <option value="gemini-2.5-pro">Google Gemini 2.5 Pro（高精度）</option>
                  </select>
                </div>

                {/* AI要約生成のルール / プロンプト */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>AI要約生成のルール / プロンプト指定</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.summaryRule || ''}
                    onChange={(e) => setFormData({ ...formData, summaryRule: e.target.value })}
                    placeholder="30〜50文字程度で本日のメモの主要な出来事・タスク・決定事項を簡潔に要約してください。"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-sans text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed resize-none"
                  />
                </div>

                {/* AI接続テストエリア */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span>AI接続テスト</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        API要約接続、および Gemini エンドポイント URL への Web/HTTP 通信状態を二重判定します。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testResult?.loading}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      <Activity className={`w-3.5 h-3.5 ${testResult?.loading ? 'animate-spin' : ''}`} />
                      <span>{testResult?.loading ? 'テスト中...' : 'AI接続テスト実行'}</span>
                    </button>
                  </div>

                  {testResult && !testResult.loading && (
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs space-y-2.5 shadow-xs">
                      {/* 最終接続テスト日時の表示 */}
                      {testResult.testedAt && (
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                          <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-sky-500" />
                            最終接続テスト日時:
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {testResult.testedAt}
                          </span>
                        </div>
                      )}

                      {/* Web/URL エンドポイント接続結果 */}
                      {testResult.urlTest && (
                        <div
                          className={`p-2.5 rounded-lg border font-medium text-[11px] flex items-start gap-2 ${
                            testResult.urlTest.success
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                              : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                          }`}
                        >
                          <Globe className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-bold mb-0.5">1. エンドポイント Web/URL 接続テスト:</div>
                            <div>{testResult.urlTest.message}</div>
                          </div>
                        </div>
                      )}

                      {/* API要約接続結果 */}
                      {testResult.apiTest && (
                        <div
                          className={`p-2.5 rounded-lg border font-medium text-[11px] flex items-start gap-2 ${
                            testResult.apiTest.success
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                              : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                          }`}
                        >
                          <Cpu className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-bold mb-0.5">2. Gemini API 要約接続テスト:</div>
                            <div>{testResult.apiTest.message}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* メイン使用要約方式の選択ラジオボタン */}
                <div className="pt-2 space-y-1.5 border-t border-slate-200 dark:border-slate-800">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>要約処理で使用するメイン方式の選択</span>
                    <span className="text-rose-500 font-bold text-sm ml-0.5">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    テストでOKとなった要約方式の中から、「今すぐ要約を更新」および「一覧へ戻る時の自動要約」で使用する方式を選択してください。
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {/* 1. API直通 */}
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors text-xs ${
                      (formData.activeSummaryMode || 'api') === 'api'
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-semibold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="activeSummaryMode"
                          value="api"
                          checked={(formData.activeSummaryMode || 'api') === 'api'}
                          onChange={() => setFormData({ ...formData, activeSummaryMode: 'api' })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="font-bold">Gemini API 直通方式 (Standard Direct API)</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Google 公式 API エンドポイントを呼び出して要約を生成</div>
                        </div>
                      </div>
                      {testResult?.apiTest?.success && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          テストOK ({testResult.apiTest.latency}ms)
                        </span>
                      )}
                    </label>

                    {/* 2. Web/プロキシ中継 */}
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors text-xs ${
                      formData.activeSummaryMode === 'web_proxy'
                        ? 'bg-sky-50/80 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200 font-semibold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="activeSummaryMode"
                          value="web_proxy"
                          checked={formData.activeSummaryMode === 'web_proxy'}
                          onChange={() => setFormData({ ...formData, activeSummaryMode: 'web_proxy' })}
                          className="text-sky-600 focus:ring-sky-500"
                        />
                        <div>
                          <div className="font-bold">Gemini Web / カスタム Base URL プロキシ方式</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">設定された Base URL / 中継プロキシを経由して要約を生成</div>
                        </div>
                      </div>
                      {testResult?.urlTest?.success && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-[10px] font-bold">
                          テストOK ({testResult.urlTest.latency}ms)
                        </span>
                      )}
                    </label>

                    {/* 3. ローカルキーワード抽出要約 */}
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors text-xs ${
                      formData.activeSummaryMode === 'local_fallback'
                        ? 'bg-slate-200/80 dark:bg-slate-800/80 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="activeSummaryMode"
                          value="local_fallback"
                          checked={formData.activeSummaryMode === 'local_fallback'}
                          onChange={() => setFormData({ ...formData, activeSummaryMode: 'local_fallback' })}
                          className="text-slate-600 focus:ring-slate-500"
                        />
                        <div>
                          <div className="font-bold">ローカル自動要約方式 (キーフレーズ抽出)</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">外部通信を一切行わず、本体内部で重要な段落・キーワードを自動抽出</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        常時利用可能
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 3. テーマ (Theme & Styling) */}
            {activeTab === 'theme' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-sky-500" />
                    <span>外観 ＆ カラーテーマ設定</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    アプリの表示モード（ライト / ダーク / システム連動）の切り替え
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'light' })}
                    className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      formData.theme === 'light'
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 shadow-md ring-2 ring-sky-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Sun className="w-6 h-6 text-amber-500" />
                    <span>ライトモード (Light)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'dark' })}
                    className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      formData.theme === 'dark'
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 shadow-md ring-2 ring-sky-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Moon className="w-6 h-6 text-indigo-400" />
                    <span>ダークモード (Dark)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'system' })}
                    className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      formData.theme === 'system'
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 shadow-md ring-2 ring-sky-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Monitor className="w-6 h-6 text-slate-500" />
                    <span>OS設定に連動 (System)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. その他 (Advanced & Backup) */}
            {activeTab === 'other' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-500" />
                    <span>高度な設定 ＆ バックアップ・連携</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    設定データの入出力およびクラウド連携の管理
                  </p>
                </div>

                {/* 設定ファイル(config.json)の入出力 */}
                <div className="space-y-2">
                  <label className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    設定データ (`config.json`) のエクスポート・インポート
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleExportConfig}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-sky-500" />
                      <span>設定を保存 (`config.json`)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleImportConfigClick}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-emerald-500" />
                      <span>設定を復元 (`config.json`)</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {statusMessage && (
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {statusMessage}
                    </p>
                  )}
                </div>

                {/* LocalStorage キャッシュ管理 ＆ 格納先情報 */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>LocalStorage 高速キャッシュ管理</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                            一時キャッシュ（最大365件）
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          UI表示の爆速化のためにブラウザ内ストレージへ一時保存されているキャッシュデータ
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('LocalStorageの一時キャッシュを消去しますか？\n（指定ローカル保存先の物理.mdファイルは削除されず安全に保護されます）')) {
                          clearLocalStorageCache();
                          setStatusMessage('LocalStorageキャッシュを消去しました。再起動時に物理ファイルから再ロードされます。');
                          setTimeout(() => setStatusMessage(null), 4000);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-500/20 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>キャッシュ全消去</span>
                    </button>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-amber-200/40 dark:border-amber-800/30 text-[11px]">
                    {/* ⚠️ キャッシュ削除の影響と注意点 */}
                    <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/50 space-y-1.5 text-[11px] mb-2">
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>キャッシュ削除の影響と注意点</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1 leading-relaxed text-[11px]">
                        <li><strong>実ファイルは削除されません:</strong> 指定ローカル保存先の `.md` メモ本体ファイルは一切削除されず保護されます。</li>
                        <li><strong>次回アクセス時に自動復旧:</strong> キャッシュ全消去後も、次回起動時またはメモ読み込み時に物理ファイルから自動再生成されます。</li>
                        <li><strong>一時的な影響:</strong> 消去直後の初回読み込み時のみ、ファイル検索・再読み込みのため数ミリ秒のロード時間がかかる場合があります。</li>
                      </ul>
                    </div>

                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      📍 LocalStorage 物理格納先パス（WebView2 データフォルダ）:
                    </div>
                    <div className="font-mono text-[10px] bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-amber-200/40 dark:border-amber-800/40 text-slate-600 dark:text-slate-400 break-all select-all">
                      %LOCALAPPDATA%\com.qudamemo.app\EBWebView\Default\Local Storage\leveldb
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      ※ メモの本体データは「全般」タブで設定された【ローカル保存先フォルダ】に `.md` 実ファイルとして永久保存されます。
                    </p>
                  </div>
                </div>

                {/* Google Drive 連動枠 */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-indigo-500" />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          Google Drive クラウド連携 (将来拡張機能)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          メモデータを自動的にGoogle Driveへ同期・保存
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.googleDriveEnabled}
                        onChange={(e) =>
                          setFormData({ ...formData, googleDriveEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* カスタム祝日・休日設定（設定ファイル保存） */}
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        カスタム祝日・休日管理 (設定ファイル保存)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        法定祝日に加えて独自の休日・創立記念日などを設定ファイル (config.json) に保存
                      </div>
                    </div>
                  </div>

                  {/* 登録入力フォーム */}
                  <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-sky-200/40 dark:border-sky-800/40">
                    <input
                      type="date"
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="祝日・休日名 (例: 夏季休暇)"
                      value={newHolidayName}
                      onChange={(e) => setNewHolidayName(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
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
                      }}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
                    >
                      追加
                    </button>
                  </div>

                  {/* 登録済み祝日一覧 */}
                  {formData.customHolidays && Object.keys(formData.customHolidays).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                      {Object.entries(formData.customHolidays).map(([d, name]) => (
                        <div
                          key={d}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-xs shadow-2xs"
                        >
                          <span className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                            {d}
                          </span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => {
                                const nextHolidays = { ...(prev.customHolidays || {}) };
                                delete nextHolidays[d];
                                return { ...prev, customHolidays: nextHolidays };
                              });
                            }}
                            className="text-slate-400 hover:text-rose-500 transition ml-0.5"
                            title="削除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic text-center py-1">
                      登録されているカスタム祝日はありません
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">
            QuDaMemo v{version} • Settings Auto-Sync
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>保存完了</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>保存して閉じる</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
