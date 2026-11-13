import { useState, useMemo } from 'react';
import {
  RotateCw,
  Search,
  Folder,
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';

function getFileBadge(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (lowerName === 'dockerfile' || lowerName.includes('config') || lowerName.endsWith('.config.js')) {
    return <span className="text-cyan-500 dark:text-cyan-400 text-xs">⚙</span>;
  }
  if (lowerName === 'package.json') {
    return <span className="text-amber-500 dark:text-amber-400 text-xs font-mono">{'{ }'}</span>;
  }

  switch (ext) {
    case 'jsx':
    case 'tsx':
      return <span className="text-cyan-500 dark:text-cyan-400 text-xs font-bold">⚛</span>;
    case 'ts':
      return <span className="text-blue-500 dark:text-blue-400 text-xs font-bold">TS</span>;
    case 'js':
      return <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">JS</span>;
    case 'css':
    case 'scss':
      return <span className="text-violet-500 dark:text-violet-400 text-xs font-bold">#</span>;
    case 'json':
      return <span className="text-amber-500 dark:text-amber-400 text-xs font-mono">{'{ }'}</span>;
    case 'html':
      return <span className="text-orange-500 dark:text-orange-400 text-xs font-bold">&lt;&gt;</span>;
    case 'md':
      return <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">M↓</span>;
    default:
      return <span className="text-slate-400 text-xs font-mono">📄</span>;
  }
}

function buildFileTree(filePaths) {
  const root = { name: '', isDirectory: true, children: {}, fullPath: '' };

  filePaths.forEach((path) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const parts = cleanPath.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          isDirectory: !isLast,
          children: {},
          fullPath: currentPath,
        };
      }
      current = current.children[part];
    });
  });

  function toSortedArray(node) {
    const items = Object.values(node.children);
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    items.forEach((item) => {
      if (item.isDirectory) {
        item.childList = toSortedArray(item);
      }
    });

    return items;
  }

  return toSortedArray(root);
}

function TreeNode({ node, level = 0, selectedFile, onSelect, expandedFolders, toggleFolder, unsavedChanges }) {
  const isSelected = selectedFile === node.fullPath || selectedFile === `/${node.fullPath}`;
  const isExpanded = expandedFolders[node.fullPath] ?? true;
  const isDirty = unsavedChanges[node.fullPath] !== undefined;

  if (node.isDirectory) {
    return (
      <div>
        <button
          onClick={() => toggleFolder(node.fullPath)}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          className="w-full text-left py-1 px-2 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 font-sans font-medium transition-colors cursor-pointer"
        >
          <svg
            className={`w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400/80 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span className="text-slate-700 dark:text-slate-300 truncate">{node.name}</span>
        </button>

        {isExpanded && node.childList && (
          <div className="space-y-0.5">
            {node.childList.map((child) => (
              <TreeNode
                key={child.fullPath}
                node={child}
                level={level + 1}
                selectedFile={selectedFile}
                onSelect={onSelect}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                unsavedChanges={unsavedChanges}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.fullPath)}
      style={{ paddingLeft: `${level * 12 + 10}px` }}
      className={`w-full text-left py-1.5 px-2.5 rounded-md flex items-center justify-between text-xs font-mono transition-all group cursor-pointer ${
        isSelected
          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-600/15 dark:border-indigo-500/30 dark:text-indigo-200 shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="shrink-0">{getFileBadge(node.name)}</span>
        <span className={`truncate ${isSelected ? 'font-medium text-indigo-900 dark:text-white' : ''}`}>{node.name}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        {isDirty && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shadow-sm" title="Unsaved changes" />
        )}
        {isSelected && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-cyan-400 shadow-glow-cyan" />
        )}
      </div>
    </button>
  );
}

export default function FileExplorer() {
  const {
    files,
    fetchFiles,
    openFile,
    selectedFile,
    isFilesLoading,
    status,
    unsavedChanges,
    startSandbox,
  } = useSandbox();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !(prev[folderPath] ?? true),
    }));
  };

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.toLowerCase().includes(q));
  }, [files, searchQuery]);

  const treeData = useMemo(() => {
    return buildFileTree(filteredFiles);
  }, [filteredFiles]);

  return (
    <aside className="w-full h-full bg-white dark:bg-obsidian-950/90 border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 select-none transition-colors duration-150">
      {/* Section Header */}
      <div className="h-10 px-3.5 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
          <span className="text-slate-800 dark:text-slate-300">File Explorer</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => fetchFiles()}
            disabled={status !== 'running' || isFilesLoading}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
            title="Refresh files"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFilesLoading ? 'animate-spin text-indigo-600 dark:text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Search Bar */}
      {status === 'running' && (
        <div className="p-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search files... (⌘P)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
            />
          </div>
        </div>
      )}

      {/* File Tree Structure */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 text-xs font-mono">
        {status !== 'running' ? (
          <div className="p-6 text-center flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-3 text-slate-500">
              <Folder className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sandbox Not Started</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[170px]">
              Start the sandbox to populate project files.
            </p>
            <button
              onClick={startSandbox}
              disabled={status === 'starting'}
              className="mt-3 px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-all cursor-pointer"
            >
              Start Sandbox
            </button>
          </div>
        ) : isFilesLoading && files.length === 0 ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-5 bg-slate-200 dark:bg-slate-800/60 rounded animate-pulse" />
            ))}
          </div>
        ) : treeData.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
            {searchQuery ? 'No matching files found' : 'No files found in sandbox'}
          </div>
        ) : (
          treeData.map((node) => (
            <TreeNode
              key={node.fullPath}
              node={node}
              level={0}
              selectedFile={selectedFile}
              onSelect={openFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              unsavedChanges={unsavedChanges}
            />
          ))
        )}
      </div>

      {/* Sidebar Footer Sync Status */}
      {status === 'running' && (
        <div className="h-8 px-3 bg-slate-50 dark:bg-obsidian-950 border-t border-slate-200 dark:border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-sm dark:shadow-glow-emerald"></span>
            <span>Synced with container</span>
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-mono">{files.length} files</span>
        </div>
      )}
    </aside>
  );
}
