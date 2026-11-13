import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io } from 'socket.io-client';
import {
  Trash2,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  PanelRight,
  Power,
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';
import { useTheme } from '../context/useTheme';
import { useLayout } from '../context/useLayout';
import ResizeDivider from './ResizeDivider';

const OBSIDIAN_TERMINAL_THEME = {
  background: '#070a0f',
  foreground: '#cbd5e1',
  cursor: '#38bdf8',
  cursorAccent: '#070a0f',
  selectionBackground: 'rgba(99, 102, 241, 0.35)',
  selectionForeground: '#ffffff',
  black: '#070a0f',
  red: '#f87171',
  green: '#34d399',
  yellow: '#fbbf24',
  blue: '#60a5fa',
  magenta: '#c084fc',
  cyan: '#38bdf8',
  white: '#f1f5f9',
  brightBlack: '#334155',
  brightRed: '#ef4444',
  brightGreen: '#10b981',
  brightYellow: '#f59e0b',
  brightBlue: '#3b82f6',
  brightMagenta: '#a855f7',
  brightCyan: '#06b6d4',
  brightWhite: '#ffffff'
};

const LIGHT_TERMINAL_THEME = {
  background: '#ffffff',
  foreground: '#0f172a',
  cursor: '#4f46e5',
  cursorAccent: '#ffffff',
  selectionBackground: 'rgba(79, 70, 229, 0.25)',
  selectionForeground: '#0f172a',
  black: '#0f172a',
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#ca8a04',
  blue: '#2563eb',
  magenta: '#9333ea',
  cyan: '#0891b2',
  white: '#f8fafc',
  brightBlack: '#64748b',
  brightRed: '#b91c1c',
  brightGreen: '#15803d',
  brightYellow: '#a16207',
  brightBlue: '#1d4ed8',
  brightMagenta: '#7e22ce',
  brightCyan: '#0e7490',
  brightWhite: '#0f172a'
};

export default function TerminalPanel({ isDockedRight = false }) {
  const { sandboxId, status, startSandbox } = useSandbox();
  const { theme } = useTheme();
  const {
    panelVisibility,
    panelSizes,
    updatePanelSize,
    togglePanelVisibility,
    terminalPosition,
    setTerminalPosition,
  } = useLayout();

  const isVisible = panelVisibility.terminal;
  const currentHeight = panelSizes.terminal || 176;
  const currentWidth = panelSizes.terminalWidth || 380;

  const terminalRef = useRef(null);
  const xtermInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);

  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'build' | 'problems'
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.options.theme =
        theme === 'dark' ? OBSIDIAN_TERMINAL_THEME : LIGHT_TERMINAL_THEME;
    }
  }, [theme]);

  useEffect(() => {
    if (!isVisible || !sandboxId || status !== 'running' || !terminalRef.current) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.dispose();
      xtermInstanceRef.current = null;
    }

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 12,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
      lineHeight: 1.3,
      theme: theme === 'dark' ? OBSIDIAN_TERMINAL_THEME : LIGHT_TERMINAL_THEME,
      allowTransparency: true,
      convertEol: true
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;34m[SandboxForge Terminal]\x1b[0m Initializing agent socket...');

    const socketUrl = `http://${sandboxId}.agent.localhost`;
    setSocketStatus('connecting');

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
      timeout: 15000,
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketStatus('connected');
      term.writeln(`\r\n\x1b[1;32m[Connected]\x1b[0m Socket connected to ${sandboxId}.agent.localhost`);
    });

    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    socket.on('output', (data) => {
      term.write(data);
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    term.onData((data) => {
      if (socket.connected) {
        socket.emit('terminal-input', data);
        socket.emit('input', data);
      }
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (err) {
        void err;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
      term.dispose();
      xtermInstanceRef.current = null;
    };
  }, [isVisible, sandboxId, status, theme]);

  const handleClear = () => {
    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.clear();
    }
  };

  const handleReconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  if (!isVisible) return null;

  return (
    <section
      style={{
        height: isDockedRight ? '100%' : isMaximized ? '100%' : currentHeight,
        width: isDockedRight ? currentWidth : '100%',
      }}
      className={`bg-white dark:bg-obsidian-950 border-t border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 select-none z-20 transition-colors duration-150 ${
        isMaximized ? 'fixed inset-x-0 bottom-0 top-14 h-auto' : ''
      }`}
      data-purpose="terminal-panel"
    >
      {/* Horizontal divider for bottom dock */}
      {!isDockedRight && !isMaximized && (
        <ResizeDivider
          direction="horizontal"
          onResize={(delta) => {
            const next = currentHeight + delta;
            updatePanelSize('terminal', Math.max(90, Math.min(window.innerHeight - 150, next)));
          }}
        />
      )}

      {/* Terminal Header Toolbar */}
      <div className="h-8 bg-slate-100 dark:bg-obsidian-900/90 border-b border-slate-200 dark:border-slate-800/80 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* Active Terminal Tab */}
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
              activeTab === 'terminal'
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 dark:bg-obsidian-950/60 dark:text-white dark:border-cyan-400 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${socketStatus === 'connected' ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
              activeTab === 'build'
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 dark:bg-obsidian-950/60 dark:text-white dark:border-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Build Logs
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
              activeTab === 'problems'
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 dark:bg-obsidian-950/60 dark:text-white dark:border-cyan-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Problems <span className="ml-1 px-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400">0</span>
          </button>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
            {socketStatus === 'connected' ? 'active' : 'idle'}
          </span>
          {status === 'running' && socketStatus !== 'connected' && (
            <button
              onClick={handleReconnect}
              title="Reconnect Socket"
              className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={handleClear} className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer" title="Clear console">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTerminalPosition(terminalPosition === 'bottom' ? 'right' : 'bottom')}
            className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title="Split/Dock terminal"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized((prev) => !prev)}
            className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title={isMaximized ? 'Restore height' : 'Maximize terminal'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => togglePanelVisibility('terminal')}
            className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-obsidian-950 p-2">
        {status !== 'running' ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-xs text-center p-4">
            <Power className="w-6 h-6 mb-2 opacity-50" />
            <span>Terminal is inactive. Click Start Sandbox to open shell.</span>
            <button
              onClick={startSandbox}
              disabled={status === 'starting'}
              className="mt-3 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
            >
              Start Sandbox
            </button>
          </div>
        ) : (
          <div ref={terminalRef} className="w-full h-full" />
        )}
      </div>
    </section>
  );
}
