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
    isCustomizing,
    setIsCustomizing,
    reorderPanels,
    setPanelVisibility,
    setTerminalPosition,
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
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-white dark:bg-obsidian-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Quick Presets Bar */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Start from a Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(PRESETS).map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-obsidian-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{p.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reorder Panels List */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Workspace Columns Order (Drag or use arrows)
            </label>
            <div className="space-y-1.5">
              {panelOrder.map((panelKey, index) => {
                const meta = PANEL_METADATA[panelKey] || { name: panelKey, icon: Code, description: '' };
                const Icon = meta.icon;
                const isVisible = panelVisibility[panelKey];
                const isDragTarget = dragOverItem === panelKey;

                return (
                  <div
                    key={panelKey}
                    draggable
                    onDragStart={(e) => handleDragStart(e, panelKey)}
                    onDragOver={(e) => handleDragOver(e, panelKey)}
                    onDrop={(e) => handleDrop(e, panelKey)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isDragTarget
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-obsidian-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="w-6 h-6 rounded-md bg-white dark:bg-obsidian-950 flex items-center justify-center text-indigo-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-800">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{meta.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{meta.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === panelOrder.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPanelVisibility(panelKey, !isVisible)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isVisible
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500/40 dark:text-cyan-300'
                            : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600'
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
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-obsidian-900 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Terminal Configuration</span>
              </div>
              <button
                onClick={() => setPanelVisibility('terminal', !panelVisibility.terminal)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  panelVisibility.terminal
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500/40 dark:text-cyan-300'
                    : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600'
                }`}
                title={panelVisibility.terminal ? 'Hide terminal' : 'Show terminal'}
              >
                {panelVisibility.terminal ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 dark:text-slate-400">Terminal Dock Location:</span>
              <div className="flex items-center bg-white dark:bg-obsidian-950 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setTerminalPosition('bottom')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    terminalPosition === 'bottom'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Bottom Panel
                </button>
                <button
                  onClick={() => setTerminalPosition('right')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    terminalPosition === 'right'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Right Side Dock
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-obsidian-950 flex items-center justify-between">
          <button
            onClick={resetLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomizing(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                saveLayout();
                setIsCustomizing(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm dark:shadow-glow-indigo transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save &amp; Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
