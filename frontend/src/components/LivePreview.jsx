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
  Sparkles,
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
  const [deviceMode, setDeviceMode] = useState('responsive'); // 'responsive' | 'tablet' | 'mobile'
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
        return 'max-w-[390px] shadow-2xl rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden my-4';
      case 'tablet':
        return 'max-w-[768px] shadow-xl rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden my-3';
      default:
        return 'w-full h-full';
    }
  };

  if (status !== 'running' || !previewUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 select-none">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center">
            <Globe className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          Live Preview Inactive
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center mb-5 leading-relaxed">
          Create a sandbox to spawn an isolated development environment and preview your live React application.
        </p>

        <button
          onClick={startSandbox}
          disabled={status === 'starting'}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
        >
          {status === 'starting' ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Creating Environment...</span>
            </>
          ) : (
            <>
              <Layers className="w-3.5 h-3.5" />
              <span>Start Development Sandbox</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Browser-like Toolbar */}
      <div className="h-10 px-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 select-none">
        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setDeviceMode('responsive')}
            title="Desktop View"
            className={`p-1 rounded transition-colors ${
              deviceMode === 'responsive'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            title="Tablet View (768px)"
            className={`p-1 rounded transition-colors ${
              deviceMode === 'tablet'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            title="Mobile View (390px)"
            className={`p-1 rounded transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-auto flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-mono">
          <Globe className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <span className="truncate flex-1 text-[11px] select-text">{previewUrl}</span>
          <button
            onClick={handleCopyUrl}
            title="Copy URL"
            className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Refresh & Open in New Tab */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleManualRefresh}
            title="Reload Preview"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new window"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 relative flex items-center justify-center p-0 overflow-auto bg-slate-200/50 dark:bg-slate-950/60">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-medium text-slate-700 dark:text-slate-200">
              <RotateCw className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Rendering live application...</span>
            </div>
          </div>
        )}

        {/* Live Iframe: Independent of IDE theme as requested */}
        <div className={`transition-all duration-300 h-full flex items-center justify-center ${getContainerWidth()}`}>
          <iframe
            key={previewKey}
            ref={iframeRef}
            src={previewUrl}
            title="Live Sandbox Preview"
            onLoad={handleIframeLoad}
            className="w-full h-full bg-white border-0 shadow-inner"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
