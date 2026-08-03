import React from 'react';
import { AppSettings } from '../types';
import {
  FileText,
  Minus,
  Square,
  X,
  Folder,
  Sun,
  Moon,
  Sparkles,
  Cpu,
  Settings as SettingsIcon,
} from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TitleBarProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenSettings: () => void;
  memoCount: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  memoCount,
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: nextTheme });
  };

  const handleMinimize = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    } catch {
      // フォールバック
    }
  };

  const handleToggleMaximize = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.toggleMaximize();
    } catch {
      onUpdateSettings({
        ...settings,
        windowBounds: {
          ...settings.windowBounds,
          isMaximized: !settings.windowBounds.isMaximized,
        },
      });
    }
  };

  const handleClose = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch {
      window.close();
    }
  };

  return (
    <header
      data-tauri-drag-region
      className="select-none bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between px-3 py-1.5 text-xs font-sans shadow-xs transition-colors cursor-default"
    >
      {/* Left section: App Icon, Name, Rust Badge */}
      <div data-tauri-drag-region className="flex items-center gap-2.5 overflow-hidden">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xs">
          <FileText className="w-3.5 h-3.5" />
        </div>
        <div data-tauri-drag-region className="flex items-center gap-2">
          <span data-tauri-drag-region className="font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            QuDaMemo
          </span>
          <span data-tauri-drag-region className="text-[10px] text-slate-400 font-mono hidden sm:inline">(QuickDailyMemo)</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
            <Cpu className="w-2.5 h-2.5" />
            Rust Engine
          </span>
        </div>

        {/* Local Storage Path Indicator */}
        <button
          onClick={onOpenSettings}
          title={`保存フォルダ: ${settings.storagePath}`}
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 max-w-[280px] truncate transition"
        >
          <Folder className="w-3 h-3 text-sky-500 shrink-0" />
          <span className="truncate font-mono text-[11px]">{settings.storagePath}</span>
        </button>
      </div>

      {/* Middle section: Window geometry & info */}
      <div data-tauri-drag-region className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span data-tauri-drag-region className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          保存件数: <strong className="text-slate-700 dark:text-slate-200">{memoCount}</strong> 件
        </span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span data-tauri-drag-region className="font-mono text-[10px]">
          Pos: {settings.windowBounds.x},{settings.windowBounds.y} ({settings.windowBounds.width}x
          {settings.windowBounds.height})
        </span>
      </div>

      {/* Right section: Quick controls & Windows Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
          title="設定画面を開く"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
          title={settings.theme === 'dark' ? 'ライトモードに変更' : 'ダークモードに変更'}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
          )}
        </button>

        <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Windows Frame Controls */}
        <button
          onClick={handleMinimize}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded transition"
          title="最小化"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={handleToggleMaximize}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded transition"
          title={settings.windowBounds.isMaximized ? '元に戻す' : '最大化'}
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-rose-500 hover:text-white text-slate-500 rounded transition"
          title="閉じる"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
