import { useState, useRef } from 'react';
import {
  RotateCw,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Globe,
  Check,
  Copy,
  Layers,
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';

export default function LivePreview() {
  const {
    previewUrl,
    status,
    previewKey,
    refreshPreview,
    startSandbox,
  } = useSandbox();

  const [isLoading, setIsLoading] = useState(true);
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

  const handleCopyUrl = () => {
    if (!previewUrl) return;
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleManualRefresh = () => {
    setIsLoading(true);
    refreshPreview();
  };

  // Determine viewport width based on device mode
  const getContainerWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-[390px] h-[720px] rounded-3xl border border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden my-auto';
      case 'tablet':
        return 'max-w-[768px] h-[90%] rounded-2xl border border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden my-auto';
      default:
        return 'w-full h-full';
    }
  };

  if (status !== 'running' || !previewUrl) {
    return (
      <section className="flex-1 flex flex-col bg-slate-50 dark:bg-obsidian-950 min-w-0 h-full overflow-hidden select-none transition-colors" data-purpose="live-preview-panel">
        {/* Toolbar */}
        <div className="h-10 bg-white dark:bg-obsidian-950/90 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-md text-slate-500">
            <span className="text-xs px-2 py-0.5 font-medium text-slate-600 dark:text-slate-400">Live Preview</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Offline</span>
        </div>

        {/* Empty State Surface */}
        <div className="flex-1 bg-slate-100/60 dark:bg-[#05070d] relative flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 dark:from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-obsidian-900/90 border border-slate-200 dark:border-slate-800/90 p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-cyan-400 mb-4 shadow-sm dark:shadow-glow-cyan">
              <Globe className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Live Preview Inactive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 max-w-xs">
              Start the sandbox environment to spawn the isolated microVM and render your live frontend preview.
            </p>

            <button
              onClick={startSandbox}
              disabled={status === 'starting'}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm dark:shadow-glow-indigo flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {status === 'starting' ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Sandbox...</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Start Development Sandbox</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-slate-50 dark:bg-obsidian-950 min-w-0 h-full overflow-hidden select-none transition-colors duration-150" data-purpose="live-preview-panel">
      {/* Browser Address & Device Toolbar */}
      <div className="h-10 bg-white dark:bg-obsidian-950/90 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-3 gap-3 shrink-0">
        {/* Responsive Device View Toggles */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-md">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              deviceMode === 'desktop'
                ? 'bg-white dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Desktop view"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              deviceMode === 'tablet'
                ? 'bg-white dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Tablet view (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1 rounded transition-colors cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-white dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Mobile view (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real URL Bar */}
        <div className="flex-1 max-w-xl flex items-center bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 group focus-within:border-slate-400 dark:focus-within:border-slate-700">
          <span className="text-emerald-600 dark:text-emerald-400 mr-2 flex items-center gap-1 font-mono text-[11px] shrink-0">
            <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            https://
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-mono tracking-tight truncate flex-1 select-text">
            {previewUrl.replace(/^https?:\/\//, '')}
          </span>
          <div className="ml-auto flex items-center space-x-1 pl-2 shrink-0">
            <button
              onClick={handleCopyUrl}
              className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              title="Copy URL"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
            <button
              onClick={handleManualRefresh}
              className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              title="Refresh frame"
            >
              <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-indigo-600 dark:text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Frame Actions */}
        <div className="flex items-center space-x-1">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 cursor-pointer"
            title="Open preview in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Live Preview Canvas Surface */}
      <div className="flex-1 bg-slate-200/50 dark:bg-[#05070d] relative overflow-auto flex items-center justify-center p-3">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-medium text-slate-800 dark:text-slate-200">
              <RotateCw className="w-4 h-4 animate-spin text-indigo-600 dark:text-cyan-400" />
              <span>Rendering live application...</span>
            </div>
          </div>
        )}

        {/* Live Iframe */}
        <div className={`transition-all duration-300 w-full h-full flex items-center justify-center ${getContainerWidth()}`}>
          <iframe
            key={previewKey}
            ref={iframeRef}
            src={previewUrl}
            title="Live Sandbox Preview"
            onLoad={handleIframeLoad}
            className="w-full h-full bg-white border-0 shadow-xl"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          />
        </div>
      </div>
    </section>
  );
}
