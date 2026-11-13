import { useEffect, useRef, useState, useCallback } from 'react';
import {
  RotateCcw,
  X,
  Check,
  AlertCircle,
  Save,
  Code,
  FileCheck,
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';

function getTabBadge(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'jsx' || ext === 'tsx') return <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold">⚛</span>;
  if (ext === 'css') return <span className="text-violet-600 dark:text-violet-400 text-xs font-bold">#</span>;
  if (ext === 'ts') return <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">TS</span>;
  if (ext === 'js') return <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">JS</span>;
  if (ext === 'json') return <span className="text-amber-600 dark:text-amber-400 text-xs font-mono">{'{ }'}</span>;
  return <span className="text-slate-400 text-xs">📄</span>;
}

export default function CodeEditor() {
  const {
    selectedFile,
    openTabs,
    openFile,
    closeTab,
    fileContents,
    unsavedChanges,
    updateLocalContent,
    saveFile,
    loadFileContent,
    isReadingFile,
    isSavingFile,
    status,
    startSandbox,
  } = useSandbox();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const currentContent = selectedFile
    ? (unsavedChanges[selectedFile] !== undefined
        ? unsavedChanges[selectedFile]
        : fileContents[selectedFile] ?? '')
    : '';

  const isDirty = selectedFile ? unsavedChanges[selectedFile] !== undefined : false;
  const lineCount = Math.max(1, currentContent.split('\n').length);

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleSave = useCallback(async () => {
    if (!selectedFile) return;
    setSaveError(null);
    try {
      await saveFile(selectedFile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save file');
      setTimeout(() => setSaveError(null), 4000);
    }
  }, [selectedFile, saveFile]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (selectedFile && isDirty && !isSavingFile) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, isDirty, isSavingFile, handleSave]);

  const handleDiscard = async () => {
    if (!selectedFile) return;
    try {
      await loadFileContent(selectedFile);
      updateLocalContent(selectedFile, undefined);
    } catch (err) {
      console.error('Failed to reload file:', err);
    }
  };

  const handleKeyDownInEditor = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newText = currentContent.substring(0, start) + '  ' + currentContent.substring(end);
      
      updateLocalContent(selectedFile, newText);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (status !== 'running') {
    return (
      <section className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0d121f] min-w-0 h-full overflow-hidden select-none transition-colors" data-purpose="code-editor-panel">
        <div className="h-10 bg-slate-100 dark:bg-obsidian-950/80 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Editor</span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Offline</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-3 shadow-sm dark:shadow-glow-indigo">
            <Code className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Editor Offline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Start the sandbox environment to read, edit, and save project files in real time.
          </p>
          <button
            onClick={startSandbox}
            disabled={status === 'starting'}
            className="mt-4 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            Start Sandbox
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0d121f] min-w-0 h-full overflow-hidden select-none transition-colors duration-150" data-purpose="code-editor-panel">
      {/* Editor Tabs */}
      <div className="h-10 bg-slate-100 dark:bg-obsidian-950/80 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-2">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {openTabs.length === 0 ? (
            <span className="text-xs text-slate-400 dark:text-slate-500 px-2 font-sans">No files open</span>
          ) : (
            openTabs.map((tabPath) => {
              const fileName = tabPath.split('/').pop();
              const isSelected = selectedFile === tabPath;
              const hasUnsaved = unsavedChanges[tabPath] !== undefined;

              return (
                <div
                  key={tabPath}
                  onClick={() => openFile(tabPath)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-medium cursor-pointer transition ${
                    isSelected
                      ? 'bg-white dark:bg-[#0d121f] border-t-2 border-indigo-600 dark:border-indigo-500 border-x border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-200 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
                  }`}
                >
                  {getTabBadge(fileName)}
                  <span>{fileName}</span>
                  {hasUnsaved && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tabPath);
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 ml-1 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Tab Actions */}
        {selectedFile && (
          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 shrink-0 pl-2">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mr-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
            {saveError && (
              <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium mr-1">
                <AlertCircle className="w-3 h-3" /> Error
              </span>
            )}
            {isDirty && (
              <button
                onClick={handleDiscard}
                title="Discard changes"
                className="p-1 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            {isDirty && (
              <button
                onClick={handleSave}
                disabled={isSavingFile}
                title="Save document (Ctrl+S)"
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium cursor-pointer"
              >
                <Save className="w-3 h-3" />
                <span>{isSavingFile ? 'Saving...' : 'Save'}</span>
              </button>
            )}
            <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800/70 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
              UTF-8
            </span>
          </div>
        )}
      </div>

      {/* Editor Surface */}
      {selectedFile ? (
        <div className="flex-1 relative flex overflow-hidden font-mono text-[13px] leading-6 select-text bg-white dark:bg-[#0d121f]">
          {isReadingFile && (
            <div className="absolute inset-0 z-10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 dark:border-indigo-500 border-t-transparent animate-spin" />
                <span>Reading {selectedFile}...</span>
              </div>
            </div>
          )}

          {/* Line Numbers Gutter */}
          <div
            ref={lineNumbersRef}
            className="text-slate-400 dark:text-slate-600 text-right pr-4 select-none w-10 shrink-0 font-normal py-3 bg-slate-50 dark:bg-[#0d121f] border-r border-slate-200 dark:border-slate-800/50"
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Real Textarea for active file */}
          <textarea
            ref={textareaRef}
            value={currentContent}
            onChange={(e) => updateLocalContent(selectedFile, e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDownInEditor}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="flex-1 p-3 bg-transparent text-slate-900 dark:text-slate-300 font-mono text-[13px] leading-6 resize-none focus:outline-none focus:ring-0 overflow-auto whitespace-pre tab-size-2 selection:bg-indigo-500/20 dark:selection:bg-indigo-600/30"
            placeholder="// Empty file content"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs p-6 text-center">
          <FileCheck className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
          <span>Select a file from the explorer to view or edit</span>
        </div>
      )}

      {/* Bottom status line */}
      {selectedFile && (
        <div className="h-6 px-3 bg-slate-50 dark:bg-obsidian-950 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between select-none">
          <span className="truncate">{selectedFile}</span>
          <div className="flex items-center gap-3">
            <span>{lineCount} lines</span>
            <span>{currentContent.length} chars</span>
            <span className="text-indigo-600 dark:text-cyan-400">UTF-8</span>
          </div>
        </div>
      )}
    </section>
  );
}
