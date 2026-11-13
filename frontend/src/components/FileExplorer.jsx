import { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  RotateCw,
  Search,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';

// Helper to determine file icon based on file extension
function getFileIcon(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (lowerName === 'dockerfile' || lowerName === '.dockerignore') {
    return <FileCode className="w-4 h-4 text-cyan-500 shrink-0" />;
  }
  if (lowerName === '.gitignore') {
    return <FileText className="w-4 h-4 text-orange-500 shrink-0" />;
  }

  switch (ext) {
    case 'jsx':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
    case 'js':
    case 'ts':
      return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    case 'css':
    case 'scss':
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    case 'html':
      return <FileCode className="w-4 h-4 text-orange-500 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    case 'md':
      return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
    default:
      return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  }
}

// Convert flat path list ['src/App.jsx', 'index.html'] to nested tree node structure
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

  // Convert map to sorted array (directories first, then files alphabetically)
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

// Recursive Tree Node component
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
          className="w-full text-left py-1 px-2 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded text-xs text-slate-700 dark:text-slate-300 font-medium group transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {isExpanded && node.childList && (
          <div>
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
      style={{ paddingLeft: `${level * 12 + 18}px` }}
      className={`w-full text-left py-1 px-2 flex items-center justify-between rounded text-xs transition-colors group ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        {getFileIcon(node.name)}
        <span className="truncate">{node.name}</span>
      </div>
      {isDirty && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Unsaved changes" />
      )}
    </button>
  );
}

export default function FileExplorer() {
  const {
    files,
    isFilesLoading,
    selectedFile,
    openFile,
    fetchFiles,
    status,
    unsavedChanges,
    startSandbox
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
    <aside className="w-full h-full bg-slate-50/70 dark:bg-slate-900/60 flex flex-col select-none transition-colors">
      {/* Header */}
      <div className="h-10 px-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => fetchFiles()}
            disabled={status !== 'running' || isFilesLoading}
            title="Refresh file tree"
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFilesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      {status === 'running' && (
        <div className="p-2 border-b border-slate-200 dark:border-slate-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-7 pr-2 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* File List Content */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {status !== 'running' ? (
          <div className="p-4 text-center flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Folder className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Sandbox Not Started</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[170px]">
              Click Start to spawn your sandbox and view files
            </p>
            <button
              onClick={startSandbox}
              disabled={status === 'starting'}
              className="mt-3 px-3 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-all"
            >
              Start Sandbox
            </button>
          </div>
        ) : isFilesLoading && files.length === 0 ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-5 bg-slate-200 dark:bg-slate-800/70 rounded animate-pulse" />
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

      {/* Footer Info */}
      {status === 'running' && (
        <div className="h-7 px-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>{files.length} files</span>
          <span className="flex items-center gap-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            synced
          </span>
        </div>
      )}
    </aside>
  );
}
