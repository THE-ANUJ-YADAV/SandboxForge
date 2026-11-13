import {
  Layers,
  Terminal,
  FolderTree,
  Cpu,
  Moon,
  Sun,
  LayoutGrid
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';
import { useTheme } from '../context/useTheme';
import { useLayout } from '../context/useLayout';

export default function StatusBar() {
  const {
    sandboxId,
    status,
    selectedFile,
  } = useSandbox();

  const { theme } = useTheme();
  const {
    panelVisibility,
    togglePanelVisibility,
    activePreset,
    setIsCustomizing,
  } = useLayout();

  return (
    <footer className="h-6 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none shrink-0 z-30 transition-colors">
      {/* Left Items */}
      <div className="flex items-center gap-3">
        {/* Sandbox Status */}
        <div className="flex items-center gap-1.5 font-medium">
          <Layers className="w-3 h-3 text-indigo-500" />
          <span>Sandbox:</span>
          {status === 'running' ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
              {sandboxId ? `${sandboxId.substring(0, 8)}...` : 'Active'}
            </span>
          ) : (
            <span className="capitalize">{status}</span>
          )}
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="hidden sm:flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <span>•</span>
            <span className="font-mono">{selectedFile}</span>
          </div>
        )}
      </div>

      {/* Right Items */}
      <div className="flex items-center gap-3">
        {/* Layout Preset Badge / Customizer Shortcut */}
        <button
          onClick={() => setIsCustomizing(true)}
          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          title="Click to customize layout"
        >
          <LayoutGrid className="w-3 h-3 text-indigo-500" />
          <span className="capitalize">{activePreset} Layout</span>
        </button>

        {/* File Explorer Toggle */}
        <button
          onClick={() => togglePanelVisibility('explorer')}
          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <FolderTree className="w-3 h-3" />
          <span className="hidden md:inline">{panelVisibility.explorer ? 'Files' : 'Files (Hidden)'}</span>
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={() => togglePanelVisibility('terminal')}
          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <Terminal className="w-3 h-3" />
          <span className="hidden md:inline">{panelVisibility.terminal ? 'Terminal' : 'Terminal (Hidden)'}</span>
        </button>

        {/* Vite & React Engine */}
        <div className="hidden lg:flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <Cpu className="w-3 h-3" />
          <span>React 19 + Vite</span>
        </div>

        {/* Theme indicator */}
        <div className="flex items-center gap-1 text-slate-400">
          {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3 text-amber-500" />}
          <span className="capitalize">{theme}</span>
        </div>
      </div>
    </footer>
  );
}
