import { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
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

  // Close dropdown on outside click
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
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          isOpen
            ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden sm:inline">Layout</span>
        <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 capitalize hidden lg:inline">
          {activePreset}
        </span>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 text-xs select-none animate-fadeIn">
          {/* Header */}
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
              Workspace Layout
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
              Preset: {activePreset}
            </span>
          </div>

          {/* Section: Predefined Layouts */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Quick Position Controls */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800 space-y-1">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Positioning
            </div>

            {/* AI Position Switch */}
            <div className="px-2 py-1 flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Assistant Dock
              </span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-[11px]">
                <button
                  onClick={() => moveAiPosition('left')}
                  className={`px-2 py-0.5 rounded ${
                    aiIsLeft
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => moveAiPosition('right')}
                  className={`px-2 py-0.5 rounded ${
                    !aiIsLeft
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Right
                </button>
              </div>
            </div>

            {/* Swap Editor & Preview */}
            <div className="px-2 py-1 flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                Editor / Preview
              </span>
              <button
                onClick={swapEditorPreview}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
              >
                Swap Order
              </button>
            </div>

            {/* Terminal Dock Position */}
            <div className="px-2 py-1 flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Terminal Dock
              </span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-[11px]">
                <button
                  onClick={() => setTerminalPosition('bottom')}
                  className={`px-2 py-0.5 rounded ${
                    terminalPosition === 'bottom'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Bottom
                </button>
                <button
                  onClick={() => setTerminalPosition('right')}
                  className={`px-2 py-0.5 rounded ${
                    terminalPosition === 'right'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Right
                </button>
              </div>
            </div>
          </div>

          {/* Section: Panel Visibility Toggles */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    className={`flex items-center justify-between px-2 py-1 rounded text-[11px] transition-colors ${
                      isVisible
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium'
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon className="w-3 h-3 text-slate-500" />
                      {label}
                    </span>
                    {isVisible ? (
                      <Eye className="w-3 h-3 text-indigo-500 shrink-0" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-slate-400 shrink-0" />
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
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Customize Layout...
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() => {
                saveLayout();
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5 text-emerald-500" />
                Save Current Layout
              </span>
            </button>

            <button
              onClick={() => {
                resetLayout();
                setIsOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
