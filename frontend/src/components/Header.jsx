import { useState } from 'react';
import {
  Play,
  RotateCw,
  Sun,
  Moon,
  Terminal as TerminalIcon,
  FolderTree,
  ExternalLink,
  Check,
  Copy,
  Layers,
  Columns,
  Code,
  Eye,
  AlertCircle
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
      // error is handled inside context
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
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 flex items-center justify-between z-30 select-none transition-colors duration-200">
      {/* Left: Branding & Connection Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                SandboxForge
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                Cloud IDE
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Sandbox Status Badge */}
        <div className="flex items-center gap-2">
          {status === 'idle' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Offline</span>
            </div>
          )}

          {status === 'starting' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 animate-pulse">
              <RotateCw className="w-3 h-3 animate-spin" />
              <span>Creating Sandbox...</span>
            </div>
          )}

          {status === 'running' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Connected:</span>
              <button
                onClick={handleCopyId}
                title="Click to copy Sandbox ID"
                className="flex items-center gap-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                <span>{sandboxId ? `${sandboxId.substring(0, 8)}...` : 'Active'}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 opacity-70" />}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
              <AlertCircle className="w-3 h-3" />
              <span>Connection Failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: View Layout Switcher */}
      <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/70 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs font-medium">
        <button
          onClick={() => {
            setPanelVisibility('editor', true);
            setPanelVisibility('preview', true);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            isSplitActive
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Split View (Editor + Live Preview)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split</span>
        </button>
        <button
          onClick={() => {
            setPanelVisibility('editor', false);
            setPanelVisibility('preview', true);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            isPreviewOnly
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Live Preview Only"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>
        <button
          onClick={() => {
            setPanelVisibility('editor', true);
            setPanelVisibility('preview', false);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            isEditorOnly
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Code Editor Only"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
      </div>

      {/* Right: Actions, Start Button, Workspace Layout & Toggles */}
      <div className="flex items-center gap-2">
        {/* Start / Restart Button */}
        <button
          onClick={handleStart}
          disabled={status === 'starting'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            status === 'running'
              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 active:scale-95'
          } ${status === 'starting' ? 'opacity-80 cursor-not-allowed' : ''}`}
          title={status === 'running' ? 'Restart Sandbox Environment' : 'Create Sandbox Environment'}
        >
          {status === 'starting' ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
          ) : status === 'running' ? (
            <RotateCw className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{status === 'running' ? 'Restart Sandbox' : 'Start Sandbox'}</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Preview Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={status !== 'running'}
          title="Refresh Preview (F5)"
          className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            status !== 'running' ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
        </button>

        {/* Open Preview in New Tab */}
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open live preview in new window: ${previewUrl}`}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Workspace Layout Button & Popover */}
        <LayoutControls />

        {/* Toggle File Explorer */}
        <button
          onClick={() => togglePanelVisibility('explorer')}
          title={panelVisibility.explorer ? 'Hide File Explorer' : 'Show File Explorer'}
          className={`p-1.5 rounded-lg border transition-colors ${
            panelVisibility.explorer
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
        </button>

        {/* Toggle Terminal */}
        <button
          onClick={() => togglePanelVisibility('terminal')}
          title={panelVisibility.terminal ? 'Hide Terminal' : 'Show Terminal'}
          className={`p-1.5 rounded-lg border transition-colors ${
            panelVisibility.terminal
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TerminalIcon className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-amber-500 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
}
