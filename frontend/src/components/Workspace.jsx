import { useLayout } from '../context/useLayout';
import Header from './Header';
import AiChat from './AiChat';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';
import TerminalPanel from './TerminalPanel';
import StatusBar from './StatusBar';
import ResizeDivider from './ResizeDivider';
import PanelContainer from './PanelContainer';
import CustomizeLayoutModal from './CustomizeLayoutModal';
import CollapsedDock from './CollapsedDock';
import { Check } from 'lucide-react';

export default function Workspace() {
  const {
    panelOrder,
    panelVisibility,
    panelSizes,
    terminalPosition,
    updatePanelSize,
    togglePanelVisibility,
    isResizing,
    saveToast,
  } = useLayout();

  // Filter only visible horizontal panels
  const visiblePanels = panelOrder.filter((key) => panelVisibility[key]);

  // Render component for each panel key
  const renderPanelComponent = (key) => {
    switch (key) {
      case 'explorer':
        return <FileExplorer />;
      case 'editor':
        return <CodeEditor />;
      case 'preview':
        return <LivePreview />;
      case 'ai':
        return <AiChat />;
      default:
        return null;
    }
  };

  // Handle resizing between panel at index and index + 1
  const handleVerticalResize = (leftIndex, delta) => {
    const leftKey = visiblePanels[leftIndex];
    const rightKey = visiblePanels[leftIndex + 1];

    if (!leftKey) return;

    if (leftKey === 'explorer') {
      const next = (panelSizes.explorer || 250) + delta;
      updatePanelSize('explorer', Math.max(160, Math.min(500, next)));
    } else if (leftKey === 'ai') {
      const next = (panelSizes.ai || 340) + delta;
      updatePanelSize('ai', Math.max(240, Math.min(600, next)));
    } else if (rightKey === 'ai') {
      const next = (panelSizes.ai || 340) - delta;
      updatePanelSize('ai', Math.max(240, Math.min(600, next)));
    } else if (rightKey === 'explorer') {
      const next = (panelSizes.explorer || 250) - delta;
      updatePanelSize('explorer', Math.max(160, Math.min(500, next)));
    } else {
      // Resizing between editor and preview
      if (leftKey === 'editor') {
        const next = (panelSizes.editor || 450) + delta;
        updatePanelSize('editor', Math.max(200, next));
      } else if (leftKey === 'preview') {
        const next = (panelSizes.preview || 450) + delta;
        updatePanelSize('preview', Math.max(200, next));
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* 1. Header / Navbar */}
      <Header />

      {/* 2. Main Middle Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsed Dock (for restored access to collapsed sidebars) */}
        <CollapsedDock side="left" />

        {/* Center Panel Columns Row */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Main Horizontal Panels Row */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {visiblePanels.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">All panels are hidden</p>
                <p className="text-xs text-slate-400 mt-1">Use the Layout menu or side docks to restore workspace panels.</p>
              </div>
            ) : (
              visiblePanels.map((panelKey, index) => {
                const isSidebar = panelKey === 'explorer' || panelKey === 'ai';
                const panelWidth = panelSizes[panelKey];

                return (
                  <div key={panelKey} className="contents">
                    <PanelContainer
                      panelKey={panelKey}
                      isFlex={!isSidebar}
                      width={isSidebar ? panelWidth : undefined}
                      onCollapse={() => togglePanelVisibility(panelKey)}
                    >
                      {renderPanelComponent(panelKey)}
                    </PanelContainer>

                    {/* Resizable Divider between adjacent panels */}
                    {index < visiblePanels.length - 1 && (
                      <ResizeDivider
                        direction="vertical"
                        onResize={(delta) => handleVerticalResize(index, delta)}
                      />
                    )}
                  </div>
                );
              })
            )}

            {/* Right-docked Terminal if terminalPosition === 'right' */}
            {terminalPosition === 'right' && panelVisibility.terminal && (
              <>
                <ResizeDivider
                  direction="vertical"
                  onResize={(delta) => {
                    const next = (panelSizes.terminalWidth || 380) - delta;
                    updatePanelSize('terminalWidth', Math.max(220, Math.min(700, next)));
                  }}
                />
                <TerminalPanel isDockedRight={true} />
              </>
            )}
          </div>

          {/* Bottom Docked Terminal if terminalPosition === 'bottom' */}
          {terminalPosition === 'bottom' && <TerminalPanel isDockedRight={false} />}
        </div>

        {/* Right Collapsed Dock */}
        <CollapsedDock side="right" />
      </div>

      {/* 3. Developer Status Bar */}
      <StatusBar />

      {/* 4. Customize Layout Modal */}
      <CustomizeLayoutModal />

      {/* 5. Resizing Iframe Shield (prevents iframe from capturing mouse drag events) */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />}

      {/* 6. Toast Notification for Layout Save / Preset Apply */}
      {saveToast && (
        <div className="fixed bottom-9 right-4 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-fadeIn border border-slate-700 dark:border-slate-300">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}
    </div>
  );
}
