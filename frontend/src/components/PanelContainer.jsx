import { useState } from 'react';
import {
  GripVertical,
  Minus,
  FolderTree,
  Code,
  Globe,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useLayout } from '../context/useLayout';

const PANEL_ICONS = {
  explorer: FolderTree,
  editor: Code,
  preview: Globe,
  ai: Sparkles,
  terminal: Terminal,
};

const PANEL_TITLES = {
  explorer: 'File Explorer',
  editor: 'Code Editor',
  preview: 'Live Preview',
  ai: 'AI Assistant',
  terminal: 'Terminal',
};

export default function PanelContainer({
  panelKey,
  children,
  width,
  isFlex = false,
  onCollapse,
}) {
  const { reorderPanels } = useLayout();
  const [dropPosition, setDropPosition] = useState(null); // 'before' | 'after' | null
  const [isDraggingSelf, setIsDraggingSelf] = useState(false);

  const Icon = PANEL_ICONS[panelKey] || Code;
  const title = PANEL_TITLES[panelKey] || panelKey;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', panelKey);
    e.dataTransfer.effectAllowed = 'move';
    setIsDraggingSelf(true);
  };

  const handleDragEnd = () => {
    setIsDraggingSelf(false);
    setDropPosition(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const pos = e.clientX < midX ? 'before' : 'after';
    setDropPosition(pos);
  };

  const handleDragLeave = (e) => {
    // Only clear if leaving the container itself
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const sourceKey = e.dataTransfer.getData('text/plain');
    if (sourceKey && sourceKey !== panelKey && dropPosition) {
      reorderPanels(sourceKey, panelKey, dropPosition);
    }
    setDropPosition(null);
    setIsDraggingSelf(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={isFlex ? { flex: 1, minWidth: 220 } : { width: width || 280, minWidth: 160 }}
      className={`relative h-full flex flex-col min-w-0 overflow-hidden bg-white dark:bg-slate-950 transition-shadow ${
        isDraggingSelf ? 'opacity-40' : ''
      }`}
    >
      {/* Drop Indicator Lines */}
      {dropPosition === 'before' && (
        <div className="absolute inset-y-0 left-0 w-1.5 bg-indigo-500 z-50 pointer-events-none shadow-lg shadow-indigo-500/50 animate-pulse">
          <div className="absolute top-2 -left-1 w-3 h-3 rounded-full bg-indigo-500" />
        </div>
      )}
      {dropPosition === 'after' && (
        <div className="absolute inset-y-0 right-0 w-1.5 bg-indigo-500 z-50 pointer-events-none shadow-lg shadow-indigo-500/50 animate-pulse">
          <div className="absolute top-2 -right-1 w-3 h-3 rounded-full bg-indigo-500" />
        </div>
      )}

      {/* Top Drag Handle & Title Strip */}
      <div className="h-7 px-2 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none shrink-0 z-10 transition-colors">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Draggable Grip Handle */}
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            title="Drag to reposition panel"
            className="cursor-grab active:cursor-grabbing p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Panel Icon & Title */}
          <Icon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
            {title}
          </span>
        </div>

        {/* Panel Action Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onCollapse}
            title={`Hide ${title}`}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Panel Content Surface */}
      <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
