import { useState, useEffect, useCallback } from 'react';
import { LayoutContext } from './LayoutContextDefinition';
import { PRESETS } from '../constants/presets';

const STORAGE_KEY = 'sandboxforge_workspace_layout_v2';

export function LayoutProvider({ children }) {
  const [layoutState, setLayoutState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.panelOrder) && parsed.panelVisibility) {
          return {
            panelOrder: parsed.panelOrder,
            panelVisibility: {
              explorer: true,
              editor: true,
              preview: true,
              ai: true,
              terminal: true,
              ...parsed.panelVisibility,
            },
            panelSizes: {
              explorer: 250,
              editor: 460,
              preview: 460,
              ai: 340,
              terminal: 220,
              ...parsed.panelSizes,
            },
            terminalPosition: parsed.terminalPosition || 'bottom',
            activePreset: parsed.activePreset || 'custom',
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved layout:', e);
    }
    return { ...PRESETS.default, activePreset: 'default' };
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [saveToast, setSaveToast] = useState(null);

  const showToast = useCallback((message) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 3000);
  }, []);

  // Auto-save to localStorage whenever layout changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutState));
    } catch (e) {
      console.warn('Failed to save layout to localStorage:', e);
    }
  }, [layoutState]);

  // Apply a predefined preset
  const applyPreset = useCallback((presetId) => {
    const preset = PRESETS[presetId];
    if (preset) {
      setLayoutState({
        panelOrder: [...preset.panelOrder],
        panelVisibility: { ...preset.panelVisibility },
        panelSizes: { ...preset.panelSizes },
        terminalPosition: preset.terminalPosition,
        activePreset: presetId,
      });
      showToast(`Applied preset: ${preset.name}`);
    }
  }, [showToast]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setLayoutState({
      ...PRESETS.default,
      panelOrder: [...PRESETS.default.panelOrder],
      panelVisibility: { ...PRESETS.default.panelVisibility },
      panelSizes: { ...PRESETS.default.panelSizes },
      activePreset: 'default',
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Reset layout to default configuration');
  }, [showToast]);

  // Save current layout explicitly
  const saveLayout = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutState));
      showToast('Workspace layout saved successfully!');
    } catch {
      showToast('Failed to save layout');
    }
  }, [layoutState, showToast]);

  // Toggle visibility of a specific panel
  const togglePanelVisibility = useCallback((panelKey) => {
    setLayoutState((prev) => {
      const nextVis = !prev.panelVisibility[panelKey];
      return {
        ...prev,
        panelVisibility: {
          ...prev.panelVisibility,
          [panelKey]: nextVis,
        },
        activePreset: 'custom',
      };
    });
  }, []);

  // Explicitly set visibility
  const setPanelVisibility = useCallback((panelKey, isVisible) => {
    setLayoutState((prev) => ({
      ...prev,
      panelVisibility: {
        ...prev.panelVisibility,
        [panelKey]: isVisible,
      },
      activePreset: 'custom',
    }));
  }, []);

  // Reorder panels via drag-and-drop
  const reorderPanels = useCallback((sourceKey, targetKey, position = 'before') => {
    if (sourceKey === targetKey) return;

    setLayoutState((prev) => {
      const currentOrder = prev.panelOrder.filter((key) => key !== sourceKey);
      const targetIndex = currentOrder.indexOf(targetKey);

      if (targetIndex === -1) return prev;

      const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
      const nextOrder = [
        ...currentOrder.slice(0, insertIndex),
        sourceKey,
        ...currentOrder.slice(insertIndex),
      ];

      return {
        ...prev,
        panelOrder: nextOrder,
        activePreset: 'custom',
      };
    });
  }, []);

  // Move AI Assistant to far left or far right
  const moveAiPosition = useCallback((side = 'left') => {
    setLayoutState((prev) => {
      const otherPanels = prev.panelOrder.filter((k) => k !== 'ai');
      const nextOrder = side === 'left' ? ['ai', ...otherPanels] : [...otherPanels, 'ai'];
      return {
        ...prev,
        panelOrder: nextOrder,
        activePreset: 'custom',
      };
    });
  }, []);

  // Move File Explorer to far left or right
  const moveExplorerPosition = useCallback((side = 'left') => {
    setLayoutState((prev) => {
      const otherPanels = prev.panelOrder.filter((k) => k !== 'explorer');
      const nextOrder = side === 'left' ? ['explorer', ...otherPanels] : [...otherPanels, 'explorer'];
      return {
        ...prev,
        panelOrder: nextOrder,
        activePreset: 'custom',
      };
    });
  }, []);

  // Swap Editor and Live Preview order
  const swapEditorPreview = useCallback(() => {
    setLayoutState((prev) => {
      const nextOrder = prev.panelOrder.map((k) => {
        if (k === 'editor') return 'preview';
        if (k === 'preview') return 'editor';
        return k;
      });
      return {
        ...prev,
        panelOrder: nextOrder,
        activePreset: 'custom',
      };
    });
  }, []);

  // Set Terminal Position ('bottom' | 'right')
  const setTerminalPosition = useCallback((position) => {
    if (position === 'bottom' || position === 'right') {
      setLayoutState((prev) => ({
        ...prev,
        terminalPosition: position,
        activePreset: 'custom',
      }));
    }
  }, []);

  // Update a panel's width or height
  const updatePanelSize = useCallback((panelKey, size) => {
    setLayoutState((prev) => ({
      ...prev,
      panelSizes: {
        ...prev.panelSizes,
        [panelKey]: Math.max(120, Math.round(size)),
      },
    }));
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        panelOrder: layoutState.panelOrder,
        panelVisibility: layoutState.panelVisibility,
        panelSizes: layoutState.panelSizes,
        terminalPosition: layoutState.terminalPosition,
        activePreset: layoutState.activePreset,
        isCustomizing,
        isResizing,
        saveToast,
        applyPreset,
        resetLayout,
        saveLayout,
        togglePanelVisibility,
        setPanelVisibility,
        reorderPanels,
        moveAiPosition,
        moveExplorerPosition,
        swapEditorPreview,
        setTerminalPosition,
        updatePanelSize,
        setIsCustomizing,
        setIsResizing,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
