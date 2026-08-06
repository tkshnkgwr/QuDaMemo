import React from 'react';
import {
  X,
  Keyboard,
  FilePlus,
  Search,
  Settings as SettingsIcon,
  HelpCircle,
  Save,
  Eye,
  Sparkles,
  ArrowLeft,
  Command,
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

interface ShortcutCategory {
  title: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const categories: ShortcutCategory[] = [
    {
      title: '全般 ＆ ナビゲーション (General & Navigation)',
      items: [
        {
          keys: [modKey, 'N'],
          description: '本日の新規メモを作成 / 開く',
          icon: <FilePlus className="w-3.5 h-3.5 text-sky-500" />,
        },
        {
          keys: [modKey, 'F'],
          description: '検索バーにフォーカス',
          icon: <Search className="w-3.5 h-3.5 text-sky-500" />,
        },
        {
          keys: [modKey, ','],
          description: '環境設定モーダルを開く',
          icon: <SettingsIcon className="w-3.5 h-3.5 text-sky-500" />,
        },
        {
          keys: ['F1'],
          description: 'キーボードショートカット確認表示',
          icon: <HelpCircle className="w-3.5 h-3.5 text-sky-500" />,
        },
        {
          keys: ['Esc'],
          description: 'モーダルを閉じる / 一覧へ戻る',
          icon: <ArrowLeft className="w-3.5 h-3.5 text-sky-500" />,
        },
      ],
    },
    {
      title: 'エディタ操作 (Editor Actions)',
      items: [
        {
          keys: [modKey, 'S'],
          description: 'メモを即座に手動保存',
          icon: <Save className="w-3.5 h-3.5 text-emerald-500" />,
        },
        {
          keys: [modKey, 'E'],
          description: '編集モード / プレビューモードの切り替え',
          icon: <Eye className="w-3.5 h-3.5 text-emerald-500" />,
        },
      ],
    },
    {
      title: 'AI要約エンジン (AI Summarization)',
      items: [
        {
          keys: [modKey, 'Enter'],
          description: '選択されたモードでAI要約を手動更新',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">キーボードショートカット (Keyboard Shortcuts)</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                QuDaMemo で利用可能な操作キー一覧
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                <span>{cat.title}</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          {kIdx > 0 && <span className="text-slate-400 font-bold text-[10px]">+</span>}
                          <kbd className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200">
                            {k}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Command className="w-3.5 h-3.5 text-sky-500" />
            <span>F1 キー または {modKey} + ? でいつでも表示できます</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
