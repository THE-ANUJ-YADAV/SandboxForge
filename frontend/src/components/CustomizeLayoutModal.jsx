import { useState } from 'react';
import {
  X,
  Sliders,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  FolderTree,
  Code,
  Globe,
  Sparkles,
  Terminal,
  Check
} from 'lucide-react';
import { useLayout } from '../context/useLayout';
import { PRESETS } from '../constants/presets';

const PANEL_METADATA = {
  explorer: { name: 'File Explorer', icon: FolderTree, description: 'Project file tree & file browser' },
  editor: { name: 'Code Editor', icon: Code, description: 'Multi-tab syntax editor & file viewer' },
  preview: { name: 'Live Preview', icon: Globe, description: 'Interactive application iframe preview' },
  ai: { name: 'AI Assistant', icon: Sparkles, description: 'AI generation chat with SSE streaming' },
  terminal: { name: 'Terminal', icon: Terminal, description: 'Xterm.js shell connected via Socket.IO' },
};

export default function CustomizeLayoutModal() {
  const {
    panelOrder,
    panelVisibility,
    terminalPosition,
    panelSizes,
    isCustomizing,
    setIsCustomizing,
    reorderPanels,
    setPanelVisibility,
    setTerminalPosition,
    updatePanelSize,
    saveLayout,
    resetLayout,
    applyPreset,
    activePreset,
  } = useLayout();

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  if (!isCustomizing) return null;

  const handleDragStart = (e, panelKey) => {
    setDraggedItem(panelKey);
    e.dataTransfer.setData('text/plain', panelKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, panelKey) => {
    e.preventDefault();
    if (draggedItem !== panelKey) {
      setDragOverItem(panelKey);
    }
  };

  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetKey) {
      reorderPanels(draggedItem, targetKey, 'before');
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const source = panelOrder[index];
      const target = panelOrder[index - 1];
      reorderPanels(source, target, 'before');
    }
  };

  const handleMoveDown = (index) => {
    if (index < panelOrder.length - 1) {
      const source = panelOrder[index];
      const target = panelOrder[index + 1];
      reorderPanels(source, target, 'after');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Customize Workspace Layout</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reorder columns, toggle visibility, and configure docking positions
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomizing(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Quick Presets Bar */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Start from a Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(PRESETS).map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{p.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                      {p.id === 'default'
                        ? 'Standard 4-column'
                        : p.id === 'ai-focus'
                        ? 'AI left dock'
                        : p.id === 'editor-focus'
                        ? 'Wider code area'
                        : 'Wider preview'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel Ordering List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspace Columns (Left to Right)
              </label>
              <span className="text-[10px] text-slate-400">Drag handles or use arrows to reorder</span>
            </div>

            <div className="space-y-2">
              {panelOrder.map((panelKey, idx) => {
                const meta = PANEL_METADATA[panelKey];
                const Icon = meta.icon;
                const isVisible = panelVisibility[panelKey];
                const isDraggingThis = draggedItem === panelKey;
                const isDragOverThis = dragOverItem === panelKey;

                return (
                  <div
                    key={panelKey}
                    onDragOver={(e) => handleDragOver(e, panelKey)}
                    onDrop={(e) => handleDrop(e, panelKey)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isDragOverThis
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50 scale-[1.01]'
                        : isDraggingThis
                        ? 'opacity-40 border-dashed border-slate-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Left: Drag Handle & Info */}
                    <div className="flex items-center gap-2.5">
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, panelKey)}
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-500 shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span>{meta.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Column #{idx + 1}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{meta.description}</div>
                      </div>
                    </div>

                    {/* Right: Controls (Visibility, Width, Arrows) */}
                    <div className="flex items-center gap-2">
                      {/* Width adjustment */}
                      <div className="hidden sm:flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400">Width:</span>
                        <input
                          type="number"
                          min={150}
                          max={900}
                          step={20}
                          value={panelSizes[panelKey] || 300}
                          onChange={(e) => updatePanelSize(panelKey, Number(e.target.value))}
                          className="w-14 text-center text-xs bg-transparent text-slate-700 dark:text-slate-200 font-mono focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">px</span>
                      </div>

                      {/* Move Up / Down Buttons */}
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          title="Move Left/Up"
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === panelOrder.length - 1}
                          title="Move Right/Down"
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Visibility Toggle Button */}
                      <button
                        onClick={() => setPanelVisibility(panelKey, !isVisible)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isVisible
                            ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                        title={isVisible ? 'Hide panel' : 'Show panel'}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal Configuration */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Terminal Configuration</span>
              </div>
              <button
                onClick={() => setPanelVisibility('terminal', !panelVisibility.terminal)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  panelVisibility.terminal
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
                title={panelVisibility.terminal ? 'Hide terminal' : 'Show terminal'}
              >
                {panelVisibility.terminal ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 dark:text-slate-400">Terminal Dock Location:</span>
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 rounded-lg">
                <button
                  onClick={() => setTerminalPosition('bottom')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    terminalPosition === 'bottom'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Bottom Panel
                </button>
                <button
                  onClick={() => setTerminalPosition('right')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    terminalPosition === 'right'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Right Side Dock
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={resetLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomizing(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                saveLayout();
                setIsCustomizing(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
