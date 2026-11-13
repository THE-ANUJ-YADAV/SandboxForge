import { useState } from 'react';
import {
  RotateCw,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';
import { useTheme } from '../context/useTheme';
import { useLayout } from '../context/useLayout';
import LayoutControls from './LayoutControls';

export default function Header() {
  const {
    sandboxId,
    previewUrl,
    status,
    startSandbox,
    refreshPreview,
  } = useSandbox();

  const { theme, toggleTheme } = useTheme();
  const {
    panelVisibility,
    togglePanelVisibility,
    setPanelVisibility,
  } = useLayout();

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleStart = async () => {
    try {
      await startSandbox();
    } catch {
      // error handled in context
    }
  };

  const handleCopyId = () => {
    if (!sandboxId) return;
    navigator.clipboard.writeText(sandboxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshPreview();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const isSplitActive = panelVisibility.editor && panelVisibility.preview;
  const isPreviewOnly = !panelVisibility.editor && panelVisibility.preview;
  const isEditorOnly = panelVisibility.editor && !panelVisibility.preview;

  return (
    <header className="h-14 bg-white/95 dark:bg-obsidian-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-3.5 flex items-center justify-between shrink-0 z-30 select-none transition-colors duration-150">
      {/* Left Brand and Session Info */}
      <div className="flex items-center space-x-3.5">
        {/* Logo */}
        <a className="flex items-center gap-2.5 group" href="#!">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-sm dark:shadow-glow-indigo">
            <div className="w-full h-full bg-white dark:bg-obsidian-950 rounded-[11px] flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-indigo-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              SandboxForge
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              Cloud IDE
            </span>
          </div>
        </a>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        {/* Live Connection Pill */}
        {status === 'running' ? (
          <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] tracking-tight text-emerald-700 dark:text-emerald-300">
              Connected: {sandboxId ? sandboxId.substring(0, 8) : 'Active'}
            </span>
            <button
              onClick={handleCopyId}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400/70 dark:hover:text-emerald-300 transition-colors cursor-pointer"
              title="Copy Sandbox ID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              )}
            </button>
          </div>
        ) : status === 'starting' ? (
          <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 px-2.5 py-1 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 animate-pulse">
            <RotateCw className="w-3 h-3 animate-spin" />
            <span className="font-mono text-[11px]">Starting sandbox...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
            <span className="font-mono text-[11px]">Offline</span>
          </div>
        )}
      </div>

      {/* Center View Switcher Segmented Control */}
      <nav className="hidden md:flex items-center bg-slate-100 dark:bg-obsidian-950/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-inner transition-colors">
        <button
          onClick={() => {
            setPanelVisibility('editor', true);
            setPanelVisibility('preview', true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            isSplitActive
              ? 'bg-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-indigo-700 text-indigo-700 dark:text-white shadow-xs dark:shadow-indigo-600/30 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          Split View
        </button>
        <button
          onClick={() => {
            setPanelVisibility('editor', false);
            setPanelVisibility('preview', true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            isPreviewOnly
              ? 'bg-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-indigo-700 text-indigo-700 dark:text-white shadow-xs dark:shadow-indigo-600/30 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          Preview
        </button>
        <button
          onClick={() => {
            setPanelVisibility('editor', true);
            setPanelVisibility('preview', false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            isEditorOnly
              ? 'bg-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-indigo-700 text-indigo-700 dark:text-white shadow-xs dark:shadow-indigo-600/30 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          Editor
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Restart / Start Sandbox Button */}
        <button
          onClick={handleStart}
          disabled={status === 'starting'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-800 dark:hover:bg-obsidian-750 border border-slate-300 dark:border-slate-700/60 shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
        >
          <svg className={`w-3.5 h-3.5 ${status === 'starting' ? 'animate-spin text-amber-500 dark:text-amber-400' : 'text-amber-500 dark:text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span>{status === 'running' ? 'Restart Sandbox' : status === 'starting' ? 'Starting...' : 'Start Sandbox'}</span>
        </button>

        {/* Reload Preview Icon */}
        <button
          onClick={handleManualRefresh}
          disabled={status !== 'running'}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors disabled:opacity-40 cursor-pointer"
          title="Reload Frame"
        >
          <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600 dark:text-cyan-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v6h6M20 20v-6h-6M4.93 19.07A10 10 0 1119.07 4.93" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </button>

        {/* Open in New Tab */}
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Open preview in new tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </a>
        )}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* Workspace Layout Selector */}
        <LayoutControls />

        {/* Terminal Quick Toggle */}
        <button
          onClick={() => togglePanelVisibility('terminal')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            panelVisibility.terminal
              ? 'text-indigo-600 bg-indigo-50 border border-indigo-200 dark:text-cyan-400 dark:bg-slate-800/80 dark:border-transparent dark:shadow-glow-cyan'
              : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-slate-800/60'
          }`}
          title="Toggle Terminal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1.5 rounded-lg text-amber-500 hover:bg-slate-100 dark:text-amber-400 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Avatar */}
        <div className="relative cursor-pointer pl-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-slate-100 dark:bg-obsidian-900 rounded-full flex items-center justify-center font-bold text-xs text-slate-700 dark:text-white transition-colors">
              A
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-obsidian-900"></span>
        </div>
      </div>
    </header>
  );
}
