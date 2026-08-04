import React, { useState, useEffect } from 'react';
import { QuickMemo, AppSettings, ActiveViewMode, SearchFilter } from './types';
import {
  loadAppSettings,
  saveAppSettings,
  loadAllMemos,
  loadAllMemosAsync,
  saveAllMemos,
  saveSingleMemo,
  deleteMemo,
  getOrCreateMemoForDate,
} from './utils/storage';
import { TitleBar } from './components/TitleBar';
import { SearchHeader } from './components/SearchHeader';
import { MemoList } from './components/MemoList';
import { CalendarView } from './components/CalendarView';
import { MemoEditor } from './components/MemoEditor';
import { SettingsModal } from './components/SettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings);
  const [memos, setMemos] = useState<QuickMemo[]>(loadAllMemos);

  // ビューおよびナビゲーションの状態
  const [viewMode, setViewMode] = useState<ActiveViewMode>('list'); // 初期起動時はリストビュー
  const [activeMemo, setActiveMemo] = useState<QuickMemo | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [summarizingMemoId, setSummarizingMemoId] = useState<string | null>(null);

  // 検索フィルターの状態
  const [filter, setFilter] = useState<SearchFilter>({
    keyword: '',
    tag: '',
    dateRange: { start: '', end: '' },
  });

  // グローバルショートカットキーリスナー (F1 / Ctrl+? / Cmd+? / Ctrl+, 等)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 キーでショートカットヘルプ表示
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Ctrl + ? / Cmd + ? でショートカットヘルプ表示
      if ((e.ctrlKey || e.metaKey) && e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Esc キーでモーダルを閉じる
      if (e.key === 'Escape') {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
          return;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
      }

      // Ctrl + N / Cmd + N で本日のメモを開く
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleOpenTodayMemo();
        return;
      }

      // Ctrl + , / Cmd + , で設定モーダルを開く
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcutsModal, isSettingsOpen, memos]);

  // 起動時にローカル保存先フォルダ(storagePath)から物理.mdファイルをロード
  useEffect(() => {
    loadAllMemosAsync(settings).then((loaded) => {
      if (loaded && loaded.length > 0) {
        setMemos(loaded);
      }
    });
  }, [settings.storagePath]);

  // ダーク/ライトテーマの同期
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (settings.theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    saveAppSettings(settings);
  }, [settings]);

  // ウィンドウサイズ変更の追跡（リサイズ時にウィンドウサイズを保存）
  useEffect(() => {
    const handleResize = () => {
      setSettings((prev) => {
        const updated = {
          ...prev,
          windowBounds: {
            ...prev.windowBounds,
            width: window.innerWidth,
            height: window.innerHeight,
          },
        };
        saveAppSettings(updated);
        return updated;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // すべてのメモから利用可能なタグを収集
  const availableTags = Array.from(
    new Set(memos.flatMap((m) => m.frontmatter.tags || []))
  ).sort();

  /**
   * メモをストレージおよびローカル指定フォルダの物理ファイル (.md) に保存
   */
  const handleSaveMemo = (updatedMemo: QuickMemo) => {
    const nextMemos = saveSingleMemo(updatedMemo, memos, settings);
    setMemos(nextMemos);
    setActiveMemo(updatedMemo);
  };

  /**
   * メモをストレージおよびディスク物理ファイルから削除
   */
  const handleDeleteMemo = (memoId: string) => {
    if (confirm(`メモ (${memoId}.md) を削除してもよろしいですか？`)) {
      deleteMemo(memoId, memos, settings).then((next) => {
        setMemos(next);
        if (activeMemo?.id === memoId) {
          setActiveMemo(null);
          setViewMode('list');
        }
      });
    }
  };

  /**
   * 今日のメモ（YYYYMMDD.md）を開くまたは新規作成（1日1メモのルールを適用）
   */
  const handleOpenTodayMemo = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const { memo, updatedMemos } = getOrCreateMemoForDate(todayStr, memos);
    setMemos(updatedMemos);
    setActiveMemo(memo);
    setViewMode('editor');
  };

  /**
   * カレンダーで選択された日付（YYYY-MM-DD）のメモを開くまたは新規作成
   */
  const handleSelectDate = (dateStr: string) => {
    const { memo, updatedMemos } = getOrCreateMemoForDate(dateStr, memos);
    setMemos(updatedMemos);
    setActiveMemo(memo);
    setViewMode('editor');
  };

  /**
   * リストからメモを選択したときのハンドラー
   */
  const handleSelectMemoFromList = (memo: QuickMemo) => {
    setActiveMemo(memo);
    setViewMode('editor');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden select-none">
      {/* Windows App Title Bar */}
      <TitleBar
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        memoCount={memos.length}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {viewMode === 'editor' && activeMemo ? (
          /* Memo Input Screen (メモ入力画面) */
          <MemoEditor
            memo={activeMemo}
            settings={settings}
            onSaveMemo={handleSaveMemo}
            onCloseEditor={() => {
              setActiveMemo(null);
              setViewMode('list'); // 閉じた際にリストビューへ戻る
            }}
            onStartBackgroundSummary={(memoId) => setSummarizingMemoId(memoId)}
            onFinishBackgroundSummary={() => {
              setSummarizingMemoId(null);
              // ディスクから再ロードして一覧画面へ反映
              loadAllMemosAsync(settings).then((loaded) => {
                if (loaded) setMemos(loaded);
              });
            }}
          />
        ) : (
          /* Startup & Main Views: List View & 6-Row Calendar View */
          <div className="flex-1 flex flex-col overflow-hidden">
            <SearchHeader
              viewMode={viewMode}
              onSelectViewMode={setViewMode}
              filter={filter}
              onUpdateFilter={setFilter}
              onOpenTodayMemo={handleOpenTodayMemo}
              onOpenShortcuts={() => setShowShortcutsModal(true)}
              availableTags={availableTags}
            />

            {viewMode === 'list' && (
              <MemoList
                memos={memos}
                filter={filter}
                onSelectMemo={handleSelectMemoFromList}
                onDeleteMemo={handleDeleteMemo}
                onOpenTodayMemo={handleOpenTodayMemo}
                summarizingMemoId={summarizingMemoId}
              />
            )}

            {(viewMode === 'calendar_month' || viewMode === 'calendar_week') && (
              <CalendarView
                memos={memos}
                filter={filter}
                calendarStartDay={settings.calendarStartDay}
                viewType={viewMode === 'calendar_week' ? 'week' : 'month'}
                onSelectDate={handleSelectDate}
              />
            )}
          </div>
        )}
      </div>

      {/* Settings Modal (設定画面) */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            saveAppSettings(newSettings);
            saveAllMemos(memos, newSettings);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Keyboard Shortcuts Modal (キーボードショートカット確認画面) */}
      {showShortcutsModal && (
        <KeyboardShortcutsModal
          onClose={() => setShowShortcutsModal(false)}
        />
      )}
    </div>
  );
}
