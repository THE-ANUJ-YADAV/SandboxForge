import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { useLayout } from '../context/useLayout';

export default function PanelContainer({
  panelKey,
  children,
  width,
  isFlex = false,
}) {
  const { reorderPanels } = useLayout();
  const [dropPosition, setDropPosition] = useState(null); // 'before' | 'after' | null
  const [isDraggingSelf, setIsDraggingSelf] = useState(false);

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
      className={`group/panel relative h-full flex flex-col min-w-0 overflow-hidden bg-white dark:bg-obsidian-950 transition-shadow ${
        isDraggingSelf ? 'opacity-40' : ''
      }`}
    >
      {/* Drop Indicator Lines */}
      {dropPosition === 'before' && (
        <div className="absolute inset-y-0 left-0 w-1.5 bg-indigo-500 z-50 pointer-events-none shadow-glow-indigo animate-pulse">
          <div className="absolute top-2 -left-1 w-3 h-3 rounded-full bg-indigo-500" />
        </div>
      )}
      {dropPosition === 'after' && (
        <div className="absolute inset-y-0 right-0 w-1.5 bg-indigo-500 z-50 pointer-events-none shadow-glow-indigo animate-pulse">
          <div className="absolute top-2 -right-1 w-3 h-3 rounded-full bg-indigo-500" />
        </div>
      )}

      {/* Floating subtle drag handle in top corner visible on hover */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        title={`Drag to reposition ${panelKey}`}
        className="absolute top-2.5 right-2 z-40 opacity-0 group-hover/panel:opacity-60 hover:!opacity-100 p-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Panel Content Surface */}
      <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
