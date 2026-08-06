import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from '@google/genai';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { QuickMemo, AppSettings } from '../types';
import { formatFrontmatterYaml, buildMarkdownFile } from '../utils/frontmatter';
import { generateFallbackSummary, downloadMarkdownFile } from '../utils/storage';
import { logger } from '../utils/logger';

// CORS制限をバイパスして安全にWeb/プロキシ通信を行うヘルパー
async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await tauriFetch(url, options as any);
  } catch (err) {
    return await window.fetch(url, options);
  }
}
import {
  Lock,
  Tag,
  Plus,
  X,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  Save,
  ArrowLeft,
  Calendar,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
} from 'lucide-react';

interface MemoEditorProps {
  memo: QuickMemo;
  settings: AppSettings;
  onSaveMemo: (updatedMemo: QuickMemo) => void;
  onCloseEditor: () => void;
  onStartBackgroundSummary?: (memoId: string) => void;
  onFinishBackgroundSummary?: (memoId: string) => void;
}

export const MemoEditor: React.FC<MemoEditorProps> = ({
  memo,
  settings,
  onSaveMemo,
  onCloseEditor,
  onStartBackgroundSummary,
  onFinishBackgroundSummary,
}) => {
  const [content, setContent] = useState(memo.content);
  const [tags, setTags] = useState<string[]>(memo.frontmatter.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [editorMode, setEditorMode] = useState<'editor' | 'preview' | 'split'>('editor');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(
    new Date(memo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // AI要約の状態
  const [aiSummary, setAiSummary] = useState<string>(memo.aiSummary || '');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryType, setSummaryType] = useState<string>(
    memo.frontmatter.summary_type || (memo.aiSummary ? 'local-fallback' : 'none')
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isModifiedRef = useRef(false);
  const initialContentRef = useRef(memo.content);

  // 計算: 行数とバイト数
  const lines = content.split('\n');
  const lineCount = lines.length;
  const byteCount = new Blob([content]).size;

  // props変更時の状態同期
  useEffect(() => {
    setContent(memo.content);
    setTags(memo.frontmatter.tags || []);
    setAiSummary(memo.aiSummary || memo.frontmatter.summary || '');
    setSummaryType(memo.frontmatter.summary_type || (memo.aiSummary ? 'local-fallback' : 'none'));
    initialContentRef.current = memo.content;
    isModifiedRef.current = false;
  }, [memo.id, memo.frontmatter.summary_type]);

  // デバウンス付き自動保存を含む入力変更ハンドラー
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
    isModifiedRef.current = true;
    setSaveStatus('dirty');
  };

  // デバウンス自動保存のエフェクト (設定された秒数入力停止後に静かに自動保存)
  useEffect(() => {
    if (saveStatus !== 'dirty') return;

    const delaySeconds = Math.max(1, settings.autoSaveIntervalSeconds || 10);
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      const nowFormatted = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const updatedFm = {
        ...memo.frontmatter,
        updated_at: nowFormatted,
        tags,
        ...(aiSummary ? { summary: aiSummary } : {}),
      };
      const rawMarkdown = buildMarkdownFile(updatedFm, content);
      const updatedMemo: QuickMemo = {
        ...memo,
        content,
        frontmatter: updatedFm,
        rawMarkdown,
        aiSummary,
        updatedAt: new Date().toISOString(),
      };

      onSaveMemo(updatedMemo);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [content, tags, saveStatus, settings.autoSaveIntervalSeconds]);

  // タグ追加
  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      const nextTags = [...tags, trimmed];
      setTags(nextTags);
      setNewTagInput('');
      setSaveStatus('dirty');
    }
  };

  // タグ削除
  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    setSaveStatus('dirty');
  };

  /**
   * AI要約クライアント直接呼び出しハンドラー (Tauri/Web完全対応)
   */
  const triggerSummarization = async (overrideContent?: string): Promise<string> => {
    const textToSummarize = overrideContent !== undefined ? overrideContent : content;
    if (!textToSummarize.trim()) {
      return '（内容が空のため要約はありません）';
    }

    setIsSummarizing(true);
    let finalSummary = '';
    let finalSummaryType = '';

    const mode = settings.activeSummaryMode || 'api';
    const apiKey = settings.geminiApiKey?.trim();
    const modelName = settings.geminiModel?.trim() || 'gemini-3.6-flash';
    const customPrompt = settings.summaryRule?.trim() || '30〜50文字程度で本日のメモの主要な出来事・タスク・決定事項を簡潔に要約してください。要約本文のみを出力してください。';
    const baseUrl = settings.geminiBaseUrl?.trim();

    try {
      if (mode === 'local_fallback') {
        logger.info('ユーザー選択設定に従いローカル要約(キーワード自動抽出)を実行');
        finalSummary = generateFallbackSummary(textToSummarize, memo.date);
        finalSummaryType = 'local-fallback';
        setSummaryType('local-fallback');
      } else if (mode === 'web_proxy') {
        // 設定された Base URL / プロキシ中継方式 (Tauri HTTP Plugin で CORS制限回避)
        const cleanBaseUrl = (baseUrl?.trim() || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
        const keyQuery = apiKey ? `?key=${encodeURIComponent(apiKey)}` : '';
        const endpoint = `${cleanBaseUrl}/v1beta/models/${modelName}:generateContent${keyQuery}`;

        logger.info(`【Web/プロキシ中継要約開始 (CORSバイパス)】 Endpoint=${endpoint}, Model=${modelName}`);

        const fetchRes = await safeFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${customPrompt}\n\n【対象メモ本文】\n${textToSummarize}` }] }],
          }),
        }).catch((netErr) => {
          logger.error(`【Web/プロキシ通信接続エラー】 エンドポイント (${endpoint}) への通信に失敗しました。`, netErr);
          throw netErr;
        });

        logger.info(`【Web/プロキシ通信レスポンス受信】 HTTP ステータス = ${fetchRes.status} (${fetchRes.statusText})`);

        if (fetchRes.ok) {
          const data = await fetchRes.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (generatedText) {
            finalSummary = generatedText;
            finalSummaryType = `${modelName} (Web-Proxy)`;
            setSummaryType(`${modelName} (Web-Proxy)`);
            logger.info(`🟢 【Web/プロキシ経由 Gemini AI要約生成成功】 モデル = ${modelName}, 要約文字数 = ${generatedText.length}文字`);
          } else {
            logger.warn(`🔴 【Web/プロキシ応答空エラー】 レスポンス JSON に要約テキストが含まれていませんでした。`, data);
            throw new Error('Gemini Proxy API returned empty text');
          }
        } else {
          const errBody = await fetchRes.text().catch(() => '');
          logger.error(`🔴 【Web/プロキシHTTPエラー ${fetchRes.status}】 レスポンス内容: ${errBody || fetchRes.statusText}`);
          throw new Error(`HTTP ${fetchRes.status}: ${errBody || fetchRes.statusText}`);
        }
      } else {
        // デフォルト: API 直通方式
        if (!apiKey) {
          throw new Error('Gemini APIキーが設定されていません');
        }

        const cleanBaseUrl = (baseUrl?.trim() || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
        logger.info(`ユーザー選択設定に従い API直通要約処理を開始: model=${modelName}`);

        let generatedText = '';
        try {
          const aiOptions: Record<string, unknown> = { apiKey };
          if (cleanBaseUrl !== 'https://generativelanguage.googleapis.com') {
            aiOptions.baseUrl = cleanBaseUrl;
          }
          const ai = new GoogleGenAI(aiOptions as any);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: `${customPrompt}\n\n【対象メモ本文】\n${textToSummarize}`,
          });
          generatedText = response.text?.trim() || '';
        } catch (sdkErr) {
          logger.warn(`API直通呼び出し例外エラー`, sdkErr);
        }

        if (generatedText) {
          finalSummary = generatedText;
          finalSummaryType = modelName;
          setSummaryType(modelName);
          logger.info(`Gemini API直通要約の生成に成功しました (${modelName})`);
        } else {
          throw new Error('Gemini API returned empty text');
        }
      }
    } catch (e: any) {
      logger.error('AI要約処理エラー発生', e);
      if (mode === 'local_fallback') {
        finalSummary = generateFallbackSummary(textToSummarize, memo.date);
        finalSummaryType = 'local-fallback';
        setSummaryType('local-fallback');
      } else {
        // ユーザーが選択したモード(Web-Proxy / API)でエラーが起きた場合は、勝手にローカル要約にすり替えずエラー理由を明記
        finalSummary = `（要約失敗: ${e?.message || '通信エラー'}）`;
        finalSummaryType = mode === 'web_proxy' ? `${modelName} (Web-Proxy Error)` : `${modelName} (API Error)`;
        setSummaryType(finalSummaryType);
      }
    } finally {
      setIsSummarizing(false);
    }

    setAiSummary(finalSummary);
    initialContentRef.current = textToSummarize;

    // 要約結果をメモオブジェクトとフロントマターに保存
    const updatedFm = {
      ...memo.frontmatter,
      tags,
      ...(finalSummary ? { summary: finalSummary } : {}),
      ...(finalSummaryType ? { summary_type: finalSummaryType } : {}),
    };
    const rawMarkdown = buildMarkdownFile(updatedFm, textToSummarize);
    onSaveMemo({
      ...memo,
      content: textToSummarize,
      frontmatter: updatedFm,
      rawMarkdown,
      aiSummary: finalSummary,
      updatedAt: new Date().toISOString(),
    });

    return finalSummary;
  };

  /**
   * プレビューでチェックボックスがクリックされた際に本文中の対応するチェックボックスをトグルする
   */
  const toggleCheckboxInContent = (targetIndex: number) => {
    let currentIndex = 0;
    const newContent = content.replace(/^(\s*[-*+]\s+)\[([ xX])\]/gm, (match, prefix, checkState) => {
      if (currentIndex === targetIndex) {
        currentIndex++;
        const nextState = checkState.trim() === '' ? 'x' : ' ';
        return `${prefix}[${nextState}]`;
      }
      currentIndex++;
      return match;
    });

    if (newContent !== content) {
      setContent(newContent);
      isModifiedRef.current = true;
      const updatedFm = {
        ...memo.frontmatter,
        tags,
        ...(aiSummary ? { summary: aiSummary } : {}),
      };
      const rawMarkdown = buildMarkdownFile(updatedFm, newContent);
      onSaveMemo({
        ...memo,
        content: newContent,
        rawMarkdown,
      });
    }
  };
  // UPDATE [2026-08-03]: 一覧画面へ待ち時間 0 秒で即座に復帰 ＆ AI要約はバックグラウンド非同期実行
  const handleClose = () => {
    const textToSave = content;
    const isTextChanged = textToSave !== initialContentRef.current || isModifiedRef.current;
    const hasNoSummary = !aiSummary || aiSummary.includes('未生成') || aiSummary.includes('要約はありません') || aiSummary.includes('スキップ');

    // 1. 直ちに最新の本文・タグをローカル確定保存
    const nowFormatted = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const currentFm = {
      ...memo.frontmatter,
      updated_at: nowFormatted,
      tags,
      ...(aiSummary ? { summary: aiSummary } : {}),
    };
    const rawMarkdown = buildMarkdownFile(currentFm, textToSave);
    const updatedMemo: QuickMemo = {
      ...memo,
      content: textToSave,
      frontmatter: currentFm,
      rawMarkdown,
      aiSummary,
      updatedAt: new Date().toISOString(),
    };
    onSaveMemo(updatedMemo);

    // 2. 待たずに瞬時に一覧画面へ切り替え
    onCloseEditor();

    // 3. テキスト変更時または要約未作成時はバックグラウンドで非同期で要約を実行
    if ((isTextChanged || hasNoSummary) && textToSave.trim()) {
      logger.info('【バックグラウンドAI要約開始】一覧画面への復帰後、非同期で要約を生成・保存します');
      onStartBackgroundSummary?.(memo.id);
      setTimeout(() => {
        triggerSummarization(textToSave)
          .catch((err) => {
            logger.error('バックグラウンドAI要約中に例外が発生しました', err);
          })
          .finally(() => {
            onFinishBackgroundSummary?.(memo.id);
          });
      }, 50);
    }
  };

  const yamlPreview = formatFrontmatterYaml({
    ...memo.frontmatter,
    tags,
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* エディターヘッダーツールバー */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            title="一覧画面に戻る（自動要約を実行して保存）"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>閉じる＆一覧へ</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {memo.filename}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({memo.frontmatter.weekday}
              {memo.frontmatter.holiday ? ` / 祝日: ${memo.frontmatter.holiday}` : ''})
            </span>
          </div>
        </div>

        {/* View mode toggle & auto-save status */}
        <div className="flex items-center gap-3">
          {/* Auto save indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                <span>自動保存中...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-mono text-[11px]">自動保存完了 ({lastSavedTime})</span>
              </>
            )}
            {saveStatus === 'dirty' && (
              <>
                <Save className="w-3.5 h-3.5 text-amber-500" />
                <span>編集あり</span>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Mode switch */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setEditorMode('editor')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition ${
                editorMode === 'editor'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              編集
            </button>
            <button
              onClick={() => setEditorMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition ${
                editorMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3 h-3" />
              分割
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition ${
                editorMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3" />
              プレビュー
            </button>
          </div>

          <button
            onClick={() => downloadMarkdownFile(memo)}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
            title="Markdownファイル (.md) をダウンロード"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* メインコンテナ */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* 上部パネル: YAMLフロントマター表示 */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <FileCode className="w-4 h-4 text-sky-500" />
              <span>YAML フロントマター (自動生成)</span>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-500" />
              基本項目は自動計算・編集不可
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            {/* Auto Non-editable Fields */}
            <div className="md:col-span-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-16 font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  date:
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  "{memo.frontmatter.date}"
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  weekday:
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  "{memo.frontmatter.weekday}"
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  holiday:
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[11px] border flex items-center gap-1 ${
                    memo.frontmatter.holiday
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  {memo.frontmatter.holiday ? `"${memo.frontmatter.holiday}"` : 'null'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  updated_at:
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  "{memo.frontmatter.updated_at || '未設定'}"
                </span>
              </div>
              {memo.frontmatter.summary_type && (
                <div className="flex items-center gap-2">
                  <span className="w-16 font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    summary_type:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 font-semibold">
                    <Lock className="w-2.5 h-2.5 text-indigo-400" />
                    "{memo.frontmatter.summary_type}"
                  </span>
                </div>
              )}
            </div>

            {/* Editable Tags Panel */}
            <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-3 pt-2 md:pt-0">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                <Tag className="w-3 h-3 text-sky-500" />
                <span>tags: (追加・削除可能)</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-medium"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 transition ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Tag Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="新しいタグを入力..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
                <button
                  onClick={handleAddTag}
                  className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 中央パネル: メモ本文入力エリア（10行表示目安・行番号・80バイトガイドライン） */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden min-h-[320px]">
          {/* エディーターステータスバー / ルーラー情報 */}
          <div className="bg-slate-100/70 dark:bg-slate-800/60 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-4">
              <span>目安: 10行表示枠</span>
              <span>
                行数: <strong className="text-slate-800 dark:text-slate-200">{lineCount}</strong> 行
              </span>
              <span>
                文字数: <strong className="text-slate-800 dark:text-slate-200">{content.length}</strong> 字
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
                80バイト目安規約 ({byteCount} B)
              </span>
            </div>
          </div>

          {/* Editor & Preview Workspace */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Editor View */}
            {(editorMode === 'editor' || editorMode === 'split') && (
              <div className="flex-1 flex overflow-hidden relative">
                {/* Line Numbers Column */}
                <div className="select-none bg-slate-50 dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 font-mono text-xs py-3 px-2 text-right min-w-[3rem] leading-6 overflow-hidden">
                  {Array.from({ length: Math.max(10, lineCount) }).map((_, idx) => (
                    <div key={idx} className="h-6">
                      {idx + 1}
                    </div>
                  ))}
                </div>

                {/* Textarea Input */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                  {/* Visual 80-byte column ruler guide */}
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none border-r border-dashed border-rose-400/30 dark:border-rose-500/20 z-10"
                    style={{ left: 'calc(80 * 0.6em + 1rem)' }}
                    title="80バイト/80文字目安ライン"
                  />

                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="メモの内容をMarkdown形式で入力してください..."
                    className="w-full h-full p-3 bg-transparent text-slate-800 dark:text-slate-100 font-mono text-xs leading-6 resize-none focus:outline-hidden selection:bg-sky-200 dark:selection:bg-sky-900 overflow-y-auto"
                    style={{
                      minHeight: '240px', // 10行表示枠のガイドライン (24px * 10)
                      tabSize: 2,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Split Divider */}
            {editorMode === 'split' && (
              <div className="w-px bg-slate-200 dark:bg-slate-800" />
            )}

            {/* Markdown Preview View */}
            {(editorMode === 'preview' || editorMode === 'split') && (
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 text-xs leading-relaxed max-w-none">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">
                  Markdown リアルタイム プレビュー
                </div>
                {content.trim() ? (
                  <div className="markdown-body">
                    {(() => {
                      let checkboxIndex = 0;
                      return (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            ul: ({ children, className }) => {
                              const isTaskList = className?.includes('contains-task-list');
                              return (
                                <ul className={`${isTaskList ? 'list-none pl-1 space-y-1' : 'list-disc pl-5 space-y-1'} my-2`}>
                                  {children}
                                </ul>
                              );
                            },
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
                            ),
                            li: ({ children, className, ...props }) => {
                              const isTaskItem = className?.includes('task-list-item');
                              return (
                                <li className={`${isTaskItem ? 'list-none flex items-start gap-2 my-1' : 'my-0.5'}`} {...props}>
                                  {children}
                                </li>
                              );
                            },
                            input: ({ type, checked, ...props }) => {
                              if (type === 'checkbox') {
                                const currentIndex = checkboxIndex++;
                                return (
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleCheckboxInContent(currentIndex)}
                                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 cursor-pointer accent-sky-500 shrink-0"
                                  />
                                );
                              }
                              return <input type={type} {...props} />;
                            },
                            p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold my-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => <h2 className="text-base font-bold my-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold my-1.5">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-3 border-sky-500 pl-3 my-2 italic text-slate-600 dark:text-slate-400">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children, className }) => (
                              <code className={`${className || ''} bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]`}>
                                {children}
                              </code>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <table className="w-full text-xs text-left border-collapse">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">{children}</tbody>
                            ),
                            tr: ({ children }) => (
                              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">{children}</tr>
                            ),
                            th: ({ children }) => (
                              <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700/60 last:border-r-0">{children}</th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 last:border-r-0">{children}</td>
                            ),
                          }}
                        >
                          {content}
                        </ReactMarkdown>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">内容がありません。</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 下部パネル: 編集不可AI要約フィールド */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                メモの要約 (AI自動生成・編集不可)
              </h3>
              {summaryType && summaryType !== 'none' && (
                summaryType === 'local-fallback' || summaryType.includes('fallback') ? (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                    ローカル自動要約 (キーフレーズ抽出)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-semibold">
                    Gemini AI要約 ({summaryType})
                  </span>
                )
              )}
            </div>

            <button
              onClick={() => triggerSummarization()}
              disabled={isSummarizing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 font-medium text-xs border border-sky-200 dark:border-sky-800 transition disabled:opacity-50"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>要約生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span>今すぐ要約を更新</span>
                </>
              )}
            </button>
          </div>

          {/* Non-Editable Summary Display Box */}
          <div className="relative">
            <textarea
              readOnly
              value={isSummarizing ? 'AIによる要約を生成中です...' : aiSummary}
              placeholder="画面を閉じた際にAI要約が自動作成されます。"
              className="w-full h-18 p-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-sans text-xs leading-relaxed resize-none focus:outline-hidden cursor-not-allowed select-text"
            />
            <div className="absolute right-2 bottom-2 text-[10px] text-slate-400 pointer-events-none flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>編集不可項目</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
