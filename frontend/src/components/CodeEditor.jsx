import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Save,
  RotateCcw,
  X,
  FileCode,
  FileCheck,
  Code,
  Check,
  AlertCircle
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';

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
  } = useSandbox();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Active content: local unsaved change if exists, else cached content, else empty string
  const currentContent = selectedFile
    ? (unsavedChanges[selectedFile] !== undefined
        ? unsavedChanges[selectedFile]
        : fileContents[selectedFile] ?? '')
    : '';

  const isDirty = selectedFile ? unsavedChanges[selectedFile] !== undefined : false;

  // Count lines for line numbers gutter
  const lineCount = Math.max(1, currentContent.split('\n').length);

  // Synchronize scroll between line numbers gutter and code textarea
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

  // Keyboard shortcut Ctrl+S / Cmd+S to save
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
      // Remove local unsaved changes
      updateLocalContent(selectedFile, undefined);
    } catch (err) {
      console.error('Failed to reload file:', err);
    }
  };

  // Handle Tab key in textarea
  const handleKeyDownInEditor = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      // Insert 2 spaces
      const newText =
        currentContent.substring(0, start) + '  ' + currentContent.substring(end);
      updateLocalContent(selectedFile, newText);

      // Restore cursor position after render
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (status !== 'running') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500 select-none">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-3">
          <Code className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Editor Offline</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm text-center">
          Start the sandbox to read, edit, and save project files in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden select-none">
      {/* File Tabs Header */}
      <div className="h-10 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-2 gap-2 overflow-x-auto">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {openTabs.length === 0 ? (
            <span className="text-xs text-slate-400 dark:text-slate-500 px-2">No files open</span>
          ) : (
            openTabs.map((tabPath) => {
              const fileName = tabPath.split('/').pop();
              const isSelected = selectedFile === tabPath;
              const hasUnsaved = unsavedChanges[tabPath] !== undefined;

              return (
                <div
                  key={tabPath}
                  onClick={() => openFile(tabPath)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer border-t-2 transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-950 border-indigo-500 text-slate-900 dark:text-white font-medium shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span className="truncate max-w-[140px]">{fileName}</span>
                  {hasUnsaved ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" />
                  ) : null}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tabPath);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                    title="Close tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons for current file */}
        {selectedFile && (
          <div className="flex items-center gap-2 shrink-0">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium animate-fadeIn">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}

            {saveError && (
              <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                <AlertCircle className="w-3 h-3" /> Error saving
              </span>
            )}

            {isDirty && (
              <button
                onClick={handleDiscard}
                title="Discard unsaved changes"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={!isDirty || isSavingFile}
              title="Save changes (Ctrl+S)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                isDirty
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingFile ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Surface */}
      {selectedFile ? (
        <div className="flex-1 relative flex overflow-hidden font-mono text-xs select-text">
          {isReadingFile ? (
            <div className="absolute inset-0 z-10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <FileCode className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Reading {selectedFile}...</span>
              </div>
            </div>
          ) : null}

          {/* Line Numbers Gutter */}
          <div
            ref={lineNumbersRef}
            className="w-12 py-3 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800/80 text-right pr-3 select-none text-slate-400 dark:text-slate-600 font-mono text-[11px] leading-5 overflow-hidden shrink-0"
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Text Area */}
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
            className="flex-1 p-3 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-[12px] leading-5 resize-none focus:outline-none focus:ring-0 overflow-auto whitespace-pre tab-size-2"
            placeholder="// Empty file content"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-xs">
          <FileCheck className="w-8 h-8 mb-2 opacity-50" />
          <span>Select a file from the explorer to view or edit</span>
        </div>
      )}

      {/* Footer Status Bar for Editor */}
      {selectedFile && (
        <div className="h-6 px-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between select-none">
          <span className="truncate">{selectedFile}</span>
          <div className="flex items-center gap-3">
            <span>{lineCount} lines</span>
            <span>{currentContent.length} chars</span>
            <span>UTF-8</span>
          </div>
        </div>
      )}
    </div>
  );
}
