import {
  FolderTree,
  Code,
  Globe,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useLayout } from '../context/useLayout';

export default function CollapsedDock({ side = 'left' }) {
  const { panelVisibility, togglePanelVisibility, panelOrder } = useLayout();

  // Find which panels in this side or in general are hidden
  const hiddenPanels = [
    { key: 'explorer', label: 'File Explorer', icon: FolderTree },
    { key: 'ai', label: 'AI Assistant', icon: Sparkles },
    { key: 'editor', label: 'Code Editor', icon: Code },
    { key: 'preview', label: 'Live Preview', icon: Globe },
    { key: 'terminal', label: 'Terminal', icon: Terminal },
  ].filter((p) => !panelVisibility[p.key]);

  // If AI is positioned on left or right, we can show appropriate dock items
  const aiIndex = panelOrder.indexOf('ai');
  const explorerIndex = panelOrder.indexOf('explorer');

  // Filter hidden panels relevant to left or right side if desired, or show relevant
  const relevantHidden = hiddenPanels.filter((p) => {
    if (side === 'left') {
      if (p.key === 'explorer' && explorerIndex < 2) return true;
      if (p.key === 'ai' && aiIndex === 0) return true;
      return false;
    } else {
      if (p.key === 'ai' && aiIndex > 1) return true;
      if (p.key === 'explorer' && explorerIndex >= 2) return true;
      if (p.key === 'editor' && !panelVisibility.editor) return true;
      if (p.key === 'preview' && !panelVisibility.preview) return true;
      return false;
    }
  });

  if (relevantHidden.length === 0) return null;

  return (
    <div
      className={`w-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col items-center py-2 gap-2 select-none shrink-0 z-20 ${
        side === 'left' ? 'border-r' : 'border-l'
      }`}
    >
      <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter writing-mode-vertical">
        Dock
      </div>
      {relevantHidden.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => togglePanelVisibility(key)}
          title={`Restore ${label}`}
          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 flex items-center justify-center transition-all shadow-xs group"
        >
          <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        </button>
      ))}
    </div>
  );
}

