
import { useEffect, useRef, useState } from 'react';

import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io } from 'socket.io-client';

import {
  Terminal as TerminalIcon,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  Power,
  GripVertical,
  PanelBottom,
  PanelRight
} from 'lucide-react';

import { useSandbox } from '../context/useSandbox';
import { useTheme } from '../context/useTheme';
import { useLayout } from '../context/useLayout';
import ResizeDivider from './ResizeDivider';

// Terminal themes
const DARK_TERMINAL_THEME = {
  background: '#090d16',
  foreground: '#f1f5f9',
  cursor: '#818cf8',
  cursorAccent: '#090d16',
  selectionBackground: 'rgba(99, 102, 241, 0.35)',
  selectionForeground: '#ffffff',
  black: '#0f172a',
  red: '#f87171',
  green: '#4ade80',
  yellow: '#facc15',
  blue: '#60a5fa',
  magenta: '#c084fc',
  cyan: '#38bdf8',
  white: '#f8fafc',
  brightBlack: '#475569',
  brightRed: '#ef4444',
  brightGreen: '#22c55e',
  brightYellow: '#eab308',
  brightBlue: '#3b82f6',
  brightMagenta: '#a855f7',
  brightCyan: '#06b6d4',
  brightWhite: '#ffffff'
};

const LIGHT_TERMINAL_THEME = {
  background: '#f8fafc',
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
  white: '#f1f5f9',
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

  const { sandboxId, status } = useSandbox();
  const { theme } = useTheme();

  const {
    panelVisibility,
    panelSizes,
    updatePanelSize,
    togglePanelVisibility,
    terminalPosition,
    setTerminalPosition
  } = useLayout();

  const isVisible = panelVisibility.terminal;
  const currentHeight = panelSizes.terminal || 220;
  const currentWidth = panelSizes.terminalWidth || 380;

  const terminalRef = useRef(null);
  const xtermInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);

  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [isMaximized, setIsMaximized] = useState(false);

  // Update terminal theme
  useEffect(() => {
    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.options.theme =
        theme === 'dark'
          ? DARK_TERMINAL_THEME
          : LIGHT_TERMINAL_THEME;
    }
  }, [theme]);

  // Initialize terminal and Socket.IO
  useEffect(() => {

    if (
      !isVisible ||
      !sandboxId ||
      status !== 'running' ||
      !terminalRef.current
    ) {
      return;
    }

    // Cleanup previous instances
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.dispose();
      xtermInstanceRef.current = null;
    }

    // Initialize XTerm
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 12,
      fontFamily:
        'ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", monospace',
      lineHeight: 1.2,
      theme:
        theme === 'dark'
          ? DARK_TERMINAL_THEME
          : LIGHT_TERMINAL_THEME,
      allowTransparency: true,
      convertEol: true
    });

    const fitAddon = new FitAddon();

    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln(
      '\x1b[1;34m[SandboxForge Terminal]\x1b[0m Initializing agent socket...'
    );

    // Dynamic Agent URL
    const socketUrl = `http://${sandboxId}.agent.localhost`;

    console.log('Connecting to Agent:', socketUrl);
    console.log('Sandbox ID:', sandboxId);

    setSocketStatus('connecting');

    // Socket.IO connection
    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],

      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,

      timeout: 20000,

      autoConnect: true
    });

    socketRef.current = socket;

    // Connected
    socket.on('connect', () => {

      setSocketStatus('connected');

      console.log('Agent Socket Connected:', socket.id);

      term.writeln(
        `\r\n\x1b[1;32m[Connected]\x1b[0m Agent host: ${socketUrl}`
      );

      term.writeln(
        '\x1b[2mType commands below (e.g. ls, npm run build, git status)\x1b[0m\r\n'
      );

      fitAddon.fit();
    });

    // Connection error
    socket.on('connect_error', (err) => {

      setSocketStatus('error');

      console.error('Socket connection error:', err);

      term.writeln(
        `\r\n\x1b[1;31m[Connection Error]\x1b[0m ${err.message}`
      );
    });

    // Disconnect
    socket.on('disconnect', (reason) => {

      setSocketStatus('disconnected');

      console.warn('Socket disconnected:', reason);

      term.writeln(
        `\r\n\x1b[1;33m[Disconnected]\x1b[0m Reason: ${reason}`
      );
    });

    // Terminal output
    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    // Terminal input
    const onDataDisposable = term.onData((data) => {

      if (socket.connected) {
        socket.emit('terminal-input', data);
      }

    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {

      try {
        fitAddon.fit();
      } catch (error) {
        console.warn('Terminal resize error:', error);
      }

    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Cleanup
    return () => {

      onDataDisposable.dispose();

      resizeObserver.disconnect();

      socket.removeAllListeners();
      socket.disconnect();

      term.dispose();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      if (xtermInstanceRef.current === term) {
        xtermInstanceRef.current = null;
      }

      fitAddonRef.current = null;

    };

  }, [sandboxId, status, isVisible, theme]);

  // Refit terminal on resize
  useEffect(() => {

    const timer = setTimeout(() => {

      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch {
          // Ignore resize errors
        }
      }

    }, 150);

    return () => clearTimeout(timer);

  }, [isMaximized, isVisible, currentHeight, currentWidth]);

  // Clear terminal
  const handleClear = () => {

    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.clear();
    }

  };

  // Reconnect socket
  const handleReconnect = () => {

    if (socketRef.current) {

      setSocketStatus('connecting');

      socketRef.current.connect();

    }

  };

  // Drag handler
  const handleDragStart = (e) => {

    e.dataTransfer.setData('text/plain', 'terminal');
    e.dataTransfer.effectAllowed = 'move';

  };

  if (!isVisible) return null;

  // RIGHT DOCKED TERMINAL
  if (isDockedRight) {

    return (
      <div
        style={{
          width: currentWidth,
          minWidth: 240
        }}
        className="h-full flex flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d16] select-none"
      >

        {/* Title Bar */}
        <div className="h-7 px-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">

          <div className="flex items-center gap-1.5">

            <div
              draggable
              onDragStart={handleDragStart}
              title="Drag terminal"
              className="cursor-grab active:cursor-grabbing p-0.5 rounded text-slate-400"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            <TerminalIcon className="w-3.5 h-3.5 text-emerald-500" />

            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Terminal
            </span>

          </div>

          <div className="flex items-center gap-1">

            <button
              onClick={() => setTerminalPosition('bottom')}
              title="Dock to Bottom"
              className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <PanelBottom className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleClear}
              title="Clear terminal"
              className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => togglePanelVisibility('terminal')}
              title="Hide terminal"
              className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

        {/* Terminal Viewport */}
        <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-[#090d16] p-2">

          {status !== 'running' ? (

            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">

              <Power className="w-6 h-6 mb-2 opacity-60" />

              <span>Click "Start Sandbox" to spawn shell</span>

            </div>

          ) : (

            <div ref={terminalRef} className="w-full h-full" />

          )}

        </div>

      </div>
    );

  }

  // BOTTOM DOCKED TERMINAL
  return (

    <div
      style={{
        height: isMaximized ? 'auto' : currentHeight
      }}
      className={`border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d16] flex flex-col transition-all duration-100 z-20 ${
        isMaximized
          ? 'fixed inset-x-0 bottom-0 top-14 h-auto'
          : 'shrink-0'
      }`}
    >

      {/* Resize Divider */}
      {!isMaximized && (

        <ResizeDivider
          direction="horizontal"
          onResize={(delta) => {

            const next = currentHeight + delta;

            updatePanelSize(
              'terminal',
              Math.max(
                90,
                Math.min(window.innerHeight - 120, next)
              )
            );

          }}
        />

      )}

      {/* Title Bar */}
      <div className="h-8 px-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none">

        <div className="flex items-center gap-2">

          <div
            draggable
            onDragStart={handleDragStart}
            title="Drag terminal"
            className="cursor-grab active:cursor-grabbing p-0.5 rounded text-slate-400"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <TerminalIcon className="w-3.5 h-3.5 text-emerald-500" />

          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Terminal
          </span>

          {/* Socket Status */}
          {status === 'running' && (

            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 dark:border-slate-700">

              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  socketStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : socketStatus === 'connecting'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-rose-500'
                }`}
              />

              <span className="capitalize text-slate-600 dark:text-slate-400">
                {socketStatus}
              </span>

            </div>

          )}

        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">

          {status === 'running' && socketStatus !== 'connected' && (

            <button
              onClick={handleReconnect}
              title="Reconnect Socket"
              className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

          )}

          <button
            onClick={() =>
              setTerminalPosition(
                terminalPosition === 'bottom' ? 'right' : 'bottom'
              )
            }
            title="Dock to Right Side"
            className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            title="Clear terminal buffer"
            className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMaximized(prev => !prev)}
            title={isMaximized ? 'Restore height' : 'Maximize terminal'}
            className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isMaximized
              ? <Minimize2 className="w-3.5 h-3.5" />
              : <Maximize2 className="w-3.5 h-3.5" />
            }
          </button>

          <button
            onClick={() => togglePanelVisibility('terminal')}
            title="Hide terminal"
            className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-[#090d16] p-2">

        {status !== 'running' ? (

          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 text-xs select-none">

            <Power className="w-6 h-6 mb-2 opacity-60" />

            <span>
              Terminal is inactive. Click "Start Sandbox" to spawn shell.
            </span>

          </div>

        ) : (

          <div ref={terminalRef} className="w-full h-full" />

        )}

      </div>

    </div>

  );

}
