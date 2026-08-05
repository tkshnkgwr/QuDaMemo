import React, { useState, useRef, useEffect } from 'react';
import { AppSettings } from '../types';
import {
  FileText,
  Minus,
  Square,
  X,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  HelpCircle,
  Settings as SettingsIcon,
  Check,
  Terminal,
  Info,
  Keyboard,
  ChevronDown,
} from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { version } from '../../package.json';

interface TitleBarProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenLogs: () => void;
  onOpenAbout: () => void;
  memoCount: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenHelp,
  onOpenLogs,
  onOpenAbout,
  memoCount,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  // メニュー外部クリック検知でメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) {
        setIsHelpMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTheme = (theme: AppSettings['theme']) => {
    onUpdateSettings({ ...settings, theme });
    setIsThemeMenuOpen(false);
  };

  const renderThemeIcon = () => {
    switch (settings.theme) {
      case 'dark':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'system':
        return <Monitor className="w-3.5 h-3.5 text-sky-500" />;
      case 'light':
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    }
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
      {/* Left section: App Icon, Name, Dynamic Version Badge */}
      <div data-tauri-drag-region className="flex items-center gap-2 overflow-hidden">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xs">
          <FileText className="w-3.5 h-3.5" />
        </div>
        <div data-tauri-drag-region className="flex items-center gap-2">
          <span data-tauri-drag-region className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            QuDaMemo
          </span>
          <span data-tauri-drag-region className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-semibold border border-slate-300/40 dark:border-slate-700/60 leading-none">
            v{version}
          </span>
        </div>
      </div>

      {/* Middle section: Memo count info */}
      <div data-tauri-drag-region className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span data-tauri-drag-region className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          保存件数: <strong className="text-slate-700 dark:text-slate-200">{memoCount}</strong> 件
        </span>
      </div>

      {/* Right section: Help (List), Settings, 3-Mode Theme (List) & Windows Buttons */}
      <div className="flex items-center gap-1">
        {/* ヘルプドロップダウンメニュー (リスト形式) */}
        <div className="relative" ref={helpMenuRef}>
          <button
            onClick={() => {
              setIsHelpMenuOpen(!isHelpMenuOpen);
              setIsThemeMenuOpen(false);
            }}
            className={`p-1.5 rounded flex items-center gap-0.5 transition cursor-pointer ${
              isHelpMenuOpen
                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title="ヘルプメニュー"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {isHelpMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-100 select-none">
              <button
                onClick={() => {
                  onOpenHelp();
                  setIsHelpMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Keyboard className="w-3.5 h-3.5 text-sky-500" />
                  キーボードショートカット
                </span>
                <span className="text-[10px] text-slate-400 font-mono">F1</span>
              </button>

              <button
                onClick={() => {
                  onOpenLogs();
                  setIsHelpMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                アプリログの確認 (View Logs)
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  onOpenAbout();
                  setIsHelpMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  QuDaMemo について
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v{version}</span>
              </button>
            </div>
          )}
        </div>

        {/* 設定ボタン */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
          title="環境設定 (Ctrl+,)"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>

        {/* テーマ選択ドロップダウン (リスト形式) */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => {
              setIsThemeMenuOpen(!isThemeMenuOpen);
              setIsHelpMenuOpen(false);
            }}
            className={`p-1.5 rounded flex items-center gap-0.5 transition cursor-pointer ${
              isThemeMenuOpen
                ? 'bg-slate-200 dark:bg-slate-800'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title="テーマの切り替え"
          >
            {renderThemeIcon()}
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-100 select-none">
              <button
                onClick={() => handleSelectTheme('light')}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ライトモード (Light)
                </span>
                {settings.theme === 'light' && <Check className="w-3.5 h-3.5 text-sky-500" />}
              </button>

              <button
                onClick={() => handleSelectTheme('dark')}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  ダークモード (Dark)
                </span>
                {settings.theme === 'dark' && <Check className="w-3.5 h-3.5 text-sky-500" />}
              </button>

              <button
                onClick={() => handleSelectTheme('system')}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-sky-500" />
                  OS設定に連動 (System)
                </span>
                {settings.theme === 'system' && <Check className="w-3.5 h-3.5 text-sky-500" />}
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Windows Frame Controls */}
        <button
          onClick={handleMinimize}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded transition cursor-pointer"
          title="最小化"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={handleToggleMaximize}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded transition cursor-pointer"
          title={settings.windowBounds.isMaximized ? '元に戻す' : '最大化'}
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-rose-500 hover:text-white text-slate-500 rounded transition cursor-pointer"
          title="閉じる"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};

