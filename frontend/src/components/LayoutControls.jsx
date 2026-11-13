import { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Save,
  Sliders,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowLeftRight,
  Sparkles,
  Code,
  Globe,
  Terminal,
  FolderTree
} from 'lucide-react';
import { useLayout } from '../context/useLayout';
import { PRESETS } from '../constants/presets';

export default function LayoutControls() {
  const {
    activePreset,
    applyPreset,
    resetLayout,
    saveLayout,
    panelVisibility,
    togglePanelVisibility,
    moveAiPosition,
    panelOrder,
    swapEditorPreview,
    terminalPosition,
    setTerminalPosition,
    setIsCustomizing,
  } = useLayout();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const aiIsLeft = panelOrder.indexOf('ai') < panelOrder.indexOf('editor');

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Workspace Layout Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Workspace Layout Settings & Presets"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition cursor-pointer ${
          isOpen
            ? 'bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-slate-800 dark:border-indigo-500/50 dark:text-white dark:shadow-glow-cyan'
            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-700/50 dark:text-slate-300'
        }`}
      >
        <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
        <span>Layout</span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono capitalize">
          {activePreset}
        </span>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-white dark:bg-obsidian-950/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl z-50 p-2 text-xs select-none animate-fadeIn transition-colors">
          {/* Header */}
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              Workspace Layout
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-medium capitalize">
              {activePreset}
            </span>
          </div>

          {/* Section: Predefined Layouts */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Predefined Layouts
            </div>
            <div className="space-y-0.5">
              {Object.values(PRESETS).map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      applyPreset(preset.id);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{preset.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 font-normal">
                        {preset.description}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Quick Rearrange Controls */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800 space-y-1.5 px-1">
            <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Quick Rearrange
            </div>

            {/* AI Position: Left vs Right */}
            <div className="flex items-center justify-between px-1.5 py-1 rounded bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800/80">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-violet-400" />
                AI Assistant
              </span>
              <div className="flex items-center bg-white dark:bg-obsidian-950 p-0.5 rounded-md text-[11px] border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => moveAiPosition('left')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    aiIsLeft
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => moveAiPosition('right')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    !aiIsLeft
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Right
                </button>
              </div>
            </div>

            {/* Swap Editor & Live Preview */}
            <button
              onClick={swapEditorPreview}
              className="w-full text-left px-2 py-1 rounded bg-slate-50 dark:bg-obsidian-900 hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 flex items-center justify-between border border-slate-200 dark:border-slate-800/80 transition-colors text-[11px] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
                Swap Editor &amp; Preview
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Toggle</span>
            </button>

            {/* Dock Terminal: Bottom vs Right */}
            <div className="flex items-center justify-between px-1.5 py-1 rounded bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800/80">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Terminal Dock
              </span>
              <div className="flex items-center bg-white dark:bg-obsidian-950 p-0.5 rounded-md text-[11px] border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setTerminalPosition('bottom')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    terminalPosition === 'bottom'
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Bottom
                </button>
                <button
                  onClick={() => setTerminalPosition('right')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    terminalPosition === 'right'
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Right
                </button>
              </div>
            </div>
          </div>

          {/* Section: Panel Visibility Toggles */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Panel Visibility
            </div>
            <div className="grid grid-cols-2 gap-1 px-1">
              {[
                { key: 'explorer', label: 'Files', icon: FolderTree },
                { key: 'editor', label: 'Editor', icon: Code },
                { key: 'preview', label: 'Preview', icon: Globe },
                { key: 'ai', label: 'AI Chat', icon: Sparkles },
                { key: 'terminal', label: 'Terminal', icon: Terminal },
              ].map(({ key, label, icon: Icon }) => {
                const isVisible = panelVisibility[key];
                return (
                  <button
                    key={key}
                    onClick={() => togglePanelVisibility(key)}
                    className={`flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                      isVisible
                        ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-800 dark:text-slate-200'
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon className="w-3 h-3 text-slate-400" />
                      {label}
                    </span>
                    {isVisible ? (
                      <Eye className="w-3 h-3 text-indigo-600 dark:text-cyan-400 shrink-0" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Actions */}
          <div className="pt-2 space-y-1">
            <button
              onClick={() => {
                setIsCustomizing(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                Customize Layout...
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </button>

            <button
              onClick={() => {
                saveLayout();
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Save Current Layout
              </span>
            </button>

            <button
              onClick={() => {
                resetLayout();
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Layout
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
