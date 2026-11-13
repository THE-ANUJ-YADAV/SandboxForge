
import { useState, useCallback } from 'react';
import { SandboxContext } from './SandboxContextDefinition';

import {
  startSandboxApi,
  listFilesApi,
  readFileApi,
  updateFileApi
} from '../services/api';

export function SandboxProvider({ children }) {

  // Sandbox lifecycle state
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  // Files state
  const [files, setFiles] = useState([]);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [fileContents, setFileContents] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);

  // View & panel states
  const [previewKey, setPreviewKey] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(true);
  const [viewMode, setViewMode] = useState('split');

  // Fetch list of files for the sandbox
  const fetchFiles = useCallback(async (currentId) => {
    const idToUse = currentId || sandboxId;
    if (!idToUse) return;

    setIsFilesLoading(true);

    try {
      const fileList = await listFilesApi(idToUse);
      setFiles(fileList);
      return fileList;

    } catch (err) {
      console.error('Failed to fetch files:', err);

    } finally {
      setIsFilesLoading(false);
    }
  }, [sandboxId]);

  // Read a single file's content
  const loadFileContent = useCallback(async (filePath, currentId) => {
    const idToUse = currentId || sandboxId;
    if (!idToUse || !filePath) return '';

    setIsReadingFile(true);

    try {
      const content = await readFileApi(idToUse, filePath);

      setFileContents(prev => ({
        ...prev,
        [filePath]: content
      }));

      return content;

    } catch (err) {
      console.error(`Failed to read file ${filePath}:`, err);
      throw err;

    } finally {
      setIsReadingFile(false);
    }
  }, [sandboxId]);

  // Open a file tab and fetch content if not cached
  const openFile = useCallback(async (filePath) => {
    setSelectedFile(filePath);

    setOpenTabs(prev => {
      if (!prev.includes(filePath)) {
        return [...prev, filePath];
      }
      return prev;
    });

    if (fileContents[filePath] === undefined) {
      await loadFileContent(filePath);
    }
  }, [fileContents, loadFileContent]);

  // Close an open tab
  const closeTab = useCallback((filePath) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t !== filePath);

      if (selectedFile === filePath) {
        const next = newTabs.length > 0
          ? newTabs[newTabs.length - 1]
          : null;

        setSelectedFile(next);
      }

      return newTabs;
    });

    // Clean unsaved changes for closed tab
    setUnsavedChanges(prev => {
      const updated = { ...prev };
      delete updated[filePath];
      return updated;
    });

  }, [selectedFile]);

  // Update in-memory local changes
  const updateLocalContent = useCallback((filePath, content) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [filePath]: content
    }));
  }, []);

  // Save changes to backend via PATCH /update-files
  const saveFile = useCallback(async (filePath) => {
    if (!sandboxId || !filePath) return;

    const contentToSave = unsavedChanges[filePath] !== undefined
      ? unsavedChanges[filePath]
      : fileContents[filePath] ?? '';

    setIsSavingFile(true);

    try {
      await updateFileApi(sandboxId, filePath, contentToSave);

      setFileContents(prev => ({
        ...prev,
        [filePath]: contentToSave
      }));

      setUnsavedChanges(prev => {
        const next = { ...prev };
        delete next[filePath];
        return next;
      });

      // Trigger preview reload
      setPreviewKey(k => k + 1);

      return true;

    } catch (err) {
      console.error(`Error saving ${filePath}:`, err);
      throw err;

    } finally {
      setIsSavingFile(false);
    }
  }, [sandboxId, unsavedChanges, fileContents]);

  // Start sandbox action
  const startSandbox = useCallback(async () => {
    setStatus('starting');
    setErrorMessage(null);

    try {
      const data = await startSandboxApi();

      const newSandboxId = data.sandboxId;
      const newPreviewUrl = data.previewUrl;

      if (!newSandboxId) {
        throw new Error('Sandbox creation response missing sandboxId');
      }

      setSandboxId(newSandboxId);
      setPreviewUrl(newPreviewUrl);
      setStatus('running');

      // Fetch files immediately
      const fileList = await fetchFiles(newSandboxId);

      // Automatically open preferred file
      if (fileList && fileList.length > 0) {
        const preferred = fileList.find(f =>
          f === 'src/App.jsx' ||
          f === 'src/App.tsx' ||
          f === 'src/main.jsx'
        ) || fileList[0];

        if (preferred) {
          setSelectedFile(preferred);
          setOpenTabs([preferred]);

          try {
            await loadFileContent(preferred, newSandboxId);
          } catch (e) {
            console.warn('Initial file read notice:', e);
          }
        }
      }

      return data;

    } catch (err) {
      console.error('Failed to start sandbox:', err);

      setStatus('error');
      setErrorMessage(
        err.message || 'Unable to connect to backend sandbox service'
      );

      throw err;
    }
  }, [fetchFiles, loadFileContent]);

  // Refresh preview
  const refreshPreview = useCallback(() => {
    setPreviewKey(k => k + 1);
  }, []);

  return (
    <SandboxContext.Provider
      value={{
        sandboxId,
        previewUrl,
        status,
        errorMessage,

        files,
        isFilesLoading,
        selectedFile,
        openTabs,
        fileContents,
        unsavedChanges,
        isReadingFile,
        isSavingFile,

        previewKey,
        isTerminalOpen,
        isFileExplorerOpen,
        viewMode,

        startSandbox,
        fetchFiles,
        loadFileContent,
        openFile,
        closeTab,
        updateLocalContent,
        saveFile,
        refreshPreview,

        setSelectedFile,
        setIsTerminalOpen,
        setIsFileExplorerOpen,
        setViewMode,
      }}
    >
      {children}
    </SandboxContext.Provider>
  );
}
