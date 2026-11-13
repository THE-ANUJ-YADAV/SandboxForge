import { useSandbox } from '../context/useSandbox';
import { useTheme } from '../context/useTheme';
import { useLayout } from '../context/useLayout';

export default function StatusBar() {
  const {
    sandboxId,
    status,
    selectedFile,
  } = useSandbox();

  const { theme, toggleTheme } = useTheme();
  const {
    activePreset,
    setIsCustomizing,
  } = useLayout();

  return (
    <footer className="h-6 bg-slate-100 dark:bg-obsidian-950 border-t border-slate-200 dark:border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono select-none shrink-0 z-30 transition-colors duration-150">
      {/* Status Left */}
      <div className="flex items-center space-x-3">
        {/* Sandbox Health */}
        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'running' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
          <span className="text-slate-700 dark:text-slate-300">
            Sandbox: {status === 'running' ? (
              <span className="text-indigo-600 dark:text-cyan-400 font-mono">{sandboxId ? `${sandboxId.substring(0, 8)}...` : 'Active'}</span>
            ) : (
              <span className="text-slate-500 capitalize">{status}</span>
            )}
          </span>
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="hidden sm:flex items-center space-x-1 text-slate-600 dark:text-slate-300">
            <span>•</span>
            <span className="font-mono text-indigo-600 dark:text-cyan-300">{selectedFile}</span>
          </div>
        )}
      </div>

      {/* Status Right */}
      <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
        <button
          onClick={() => setIsCustomizing(true)}
          className="hidden md:flex items-center space-x-1 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          title="Customize workspace layout"
        >
          <svg className="w-3 h-3 text-indigo-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span className="capitalize">{activePreset === 'default' ? 'Custom 3-Column' : `${activePreset} Layout`}</span>
        </button>

        <span className="hidden sm:inline">TypeScript 5.5</span>
        <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">React 19 + Vite</span>

        {/* Theme Pill */}
        <button
          onClick={toggleTheme}
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          title={theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
        >
          <svg className="w-3 h-3 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span className="text-[10px] capitalize">{theme}</span>
        </button>
      </div>
    </footer>
  );
}
