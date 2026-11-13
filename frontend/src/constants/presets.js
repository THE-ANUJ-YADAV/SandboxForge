export const PRESETS = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'File Explorer left, Editor & Preview center, AI Assistant far right, Terminal bottom',
    panelOrder: ['explorer', 'editor', 'preview', 'ai'],
    panelVisibility: { explorer: true, editor: true, preview: true, ai: true, terminal: true },
    panelSizes: { explorer: 250, editor: 460, preview: 460, ai: 340, terminal: 220 },
    terminalPosition: 'bottom',
  },
  'ai-focus': {
    id: 'ai-focus',
    name: 'AI Focus',
    description: 'AI Assistant docked on the left, File Explorer collapsed, Editor and Preview center',
    panelOrder: ['ai', 'editor', 'preview', 'explorer'],
    panelVisibility: { ai: true, editor: true, preview: true, explorer: false, terminal: true },
    panelSizes: { ai: 400, editor: 480, preview: 480, explorer: 240, terminal: 220 },
    terminalPosition: 'bottom',
  },
  'editor-focus': {
    id: 'editor-focus',
    name: 'Editor Focus',
    description: 'Expansive Code Editor in center, Live Preview right, AI Assistant collapsed',
    panelOrder: ['explorer', 'editor', 'preview', 'ai'],
    panelVisibility: { explorer: true, editor: true, preview: true, ai: false, terminal: true },
    panelSizes: { explorer: 220, editor: 680, preview: 420, ai: 320, terminal: 180 },
    terminalPosition: 'bottom',
  },
  'preview-focus': {
    id: 'preview-focus',
    name: 'Preview Focus',
    description: 'Expansive Live Preview in center, Code Editor right, AI Assistant far right',
    panelOrder: ['explorer', 'preview', 'editor', 'ai'],
    panelVisibility: { explorer: true, preview: true, editor: true, ai: true, terminal: true },
    panelSizes: { explorer: 220, preview: 680, editor: 400, ai: 300, terminal: 180 },
    terminalPosition: 'bottom',
  },
};

