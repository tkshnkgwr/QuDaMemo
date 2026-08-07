import React from 'react';
import { AppSettings } from '../../types';
import { Key, Eye, EyeOff, Sparkles, Activity, Check, AlertCircle, Globe } from 'lucide-react';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await tauriFetch(url, options as any);
  } catch (err) {
    return await window.fetch(url, options);
  }
}

interface AiTabProps {
  formData: AppSettings;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
  showApiKey: boolean;
  setShowApiKey: React.Dispatch<React.SetStateAction<boolean>>;
  testResult: {
    loading: boolean;
    testedAt?: string;
    apiTest?: { success: boolean; latency: number; message: string };
    urlTest?: { success: boolean; latency: number; message: string };
    hasCustomKey?: boolean;
    model?: string;
    baseUrl?: string;
  } | null;
  setTestResult: React.Dispatch<React.SetStateAction<any>>;
}

export const AiTab: React.FC<AiTabProps> = ({
  formData,
  setFormData,
  showApiKey,
  setShowApiKey,
  testResult,
  setTestResult,
}) => {
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

  const handleTestConnection = async () => {
    const apiKey = formData.geminiApiKey?.trim();
    const model = formData.geminiModel || 'gemini-3.6-flash';
    const baseUrl = (formData.geminiBaseUrl?.trim() || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
    const testedAt = getFormattedNow();

    if (!apiKey) {
      const warningMsg = '⚠️ APIキーが未設定です。Gemini AI要約をご利用いただくにはAPIキーを入力してください。';
      const noKeyResult = {
        loading: false,
        testedAt,
        apiTest: { success: false, latency: 0, message: warningMsg },
        urlTest: { success: false, latency: 0, message: '⚠️ APIキーが未設定のため接続テストを行いませんでした。' },
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
          urlMessage: 'APIキー未設定のためテスト省略',
        },
      }));
      return;
    }

    setTestResult({ loading: true, model, baseUrl, hasCustomKey: true });

    let apiRes = { success: false, latency: 0, message: '' };
    let urlRes = { success: false, latency: 0, message: '' };

    // 1. 直通 Gemini API テスト
    const start1 = performance.now();
    try {
      const testEndpoint = `${baseUrl}/v1beta/models/${model}?key=${apiKey}`;
      const res = await safeFetch(testEndpoint);
      const latency1 = Math.round(performance.now() - start1);
      if (res.ok) {
        apiRes = { success: true, latency: latency1, message: `接続成功 (${model})` };
      } else {
        const errText = await res.text().catch(() => '');
        apiRes = { success: false, latency: latency1, message: `エラー ${res.status}: ${errText.slice(0, 120)}` };
      }
    } catch (err: any) {
      apiRes = { success: false, latency: Math.round(performance.now() - start1), message: err?.message || 'ネットワーク通信エラー' };
    }

    // 2. Base URL / プロキシ導通テスト
    const start2 = performance.now();
    try {
      const pingUrl = `${baseUrl}/v1beta/models?key=${apiKey}`;
      const res2 = await safeFetch(pingUrl);
      const latency2 = Math.round(performance.now() - start2);
      if (res2.ok) {
        urlRes = { success: true, latency: latency2, message: `エンドポイント応答正常 (${baseUrl})` };
      } else {
        urlRes = { success: false, latency: latency2, message: `レスポンスエラー (${res2.status})` };
      }
    } catch (err: any) {
      urlRes = { success: false, latency: Math.round(performance.now() - start2), message: err?.message || 'プロキシ非導通' };
    }

    const finalTestResult = {
      loading: false,
      testedAt,
      apiTest: apiRes,
      urlTest: urlRes,
      hasCustomKey: true,
      model,
      baseUrl,
    };

    setTestResult(finalTestResult);
    setFormData((prev) => ({
      ...prev,
      lastTestResult: {
        testedAt,
        apiSuccess: apiRes.success,
        apiMessage: apiRes.message,
        apiLatency: apiRes.latency,
        urlSuccess: urlRes.success,
        urlMessage: urlRes.message,
        urlLatency: urlRes.latency,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Gemini API Key & Model */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            Gemini API キー
          </label>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sky-500 hover:text-sky-600 underline"
          >
            Google AI Studioでキーを取得 ↗
          </a>
        </div>

        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={formData.geminiApiKey}
            onChange={(e) => setFormData((prev) => ({ ...prev, geminiApiKey: e.target.value }))}
            placeholder="AIzaSy..."
            className="w-full pl-3 pr-10 py-2 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* モデル選択 Listbox */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              使用AIモデル
            </label>
            <select
              value={formData.geminiModel || 'gemini-3.6-flash'}
              onChange={(e) => setFormData((prev) => ({ ...prev, geminiModel: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              <option value="gemini-3.6-flash">gemini-3.6-flash (標準・爆速)</option>
              <option value="gemini-3.6-pro">gemini-3.6-pro (高精度要約)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (軽量安定)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (長文対応)</option>
            </select>
          </div>

          {/* Base URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Base URL (プロキシ/カスタムエンドポイント)
            </label>
            <input
              type="text"
              value={formData.geminiBaseUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, geminiBaseUrl: e.target.value }))}
              placeholder="https://generativelanguage.googleapis.com"
              className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        </div>

        {/* AI接続テストボタン ＆ 結果エリア */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testResult?.loading}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 ${testResult?.loading ? 'animate-spin' : ''}`} />
              {testResult?.loading ? '接続テスト中...' : 'Gemini AI API 接続テスト実行'}
            </button>
            {testResult?.testedAt && (
              <span className="text-[11px] text-slate-400">最終テスト: {testResult.testedAt}</span>
            )}
          </div>

          {/* テスト結果カード */}
          {testResult && !testResult.loading && (
            <div className="space-y-2 p-3 bg-white dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              {/* APIテスト */}
              <div className="flex items-start gap-2">
                {testResult.apiTest?.success ? (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">モデル応答テスト: </span>
                  <span className={testResult.apiTest?.success ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400'}>
                    {testResult.apiTest?.message}
                  </span>
                  {Boolean(testResult.apiTest?.latency) && (
                    <span className="ml-2 text-[10px] text-slate-400">({testResult.apiTest?.latency}ms)</span>
                  )}
                </div>
              </div>

              {/* URL/プロキシテスト */}
              <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                {testResult.urlTest?.success ? (
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Base URL導通テスト: </span>
                  <span className={testResult.urlTest?.success ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                    {testResult.urlTest?.message}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 要約カスタマイズルールプロンプト */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          AI 要約生成ルール（システム指示プロンプト）
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gemini AIがメモを要約する際のアウトプット条件や制約ルールを指定します。
        </p>
        <textarea
          rows={4}
          value={formData.summaryRule}
          onChange={(e) => setFormData((prev) => ({ ...prev, summaryRule: e.target.value }))}
          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>
    </div>
  );
};
