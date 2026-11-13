import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  AlertCircle,
  Paperclip,
  CheckCircle2,
  RefreshCw,
  Clock,
  Send,
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';
import { invokeAiStream } from '../services/api';

const PROMPT_SUGGESTIONS = [
  { text: 'Change the colours of font and theme of the page.', hoverColor: 'hover:border-indigo-400 dark:hover:border-indigo-500/40' },
  { text: 'Add a modern Hero section with a gradient call-to-action.', hoverColor: 'hover:border-cyan-400 dark:hover:border-cyan-500/40' },
  { text: 'Create a responsive Navbar with a logo and navigation links.', hoverColor: 'hover:border-violet-400 dark:hover:border-violet-500/40' },
  { text: 'Add an interactive Counter component with state.', hoverColor: 'hover:border-emerald-400 dark:hover:border-emerald-500/40' },
];

let msgIdCounter = 0;
function getNextId(prefix) {
  msgIdCounter += 1;
  return `${prefix}-${msgIdCounter}`;
}

export default function AiChat() {
  const {
    sandboxId,
    status,
    fetchFiles,
    refreshPreview,
    loadFileContent,
    selectedFile,
    startSandbox,
  } = useSandbox();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am your SandboxForge AI assistant. I can help you build, style, and update frontend React applications inside this sandbox environment. Start the sandbox and tell me what you would like to build!',
      steps: [],
      timestamp: 'Initial',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerationSteps, setCurrentGenerationSteps] = useState([]);
  const [errorNotice, setErrorNotice] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentGenerationSteps, isGenerating]);

  const handleSend = async (messageText = inputPrompt) => {
    const textToSend = messageText.trim();
    if (!textToSend || isGenerating) return;

    if (!sandboxId || status !== 'running') {
      try {
        await startSandbox();
      } catch {
        setErrorNotice('Please ensure the sandbox is started to execute AI code generation.');
        setTimeout(() => setErrorNotice(null), 3500);
        return;
      }
    }

    const userMessageId = getNextId('user');
    const userMsg = {
      id: userMessageId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);
    setCurrentGenerationSteps([]);
    setErrorNotice(null);

    const stepsCollected = [];

    try {
      await invokeAiStream(sandboxId || 'default', textToSend, (event) => {
        if (event.type === 'empty') return;

        const stepRecord = {
          id: getNextId('step'),
          type: event.type,
          raw: event.raw,
          message: event.message || event.raw,
          files: event.files || [],
          time: event.time || new Date().toLocaleTimeString(),
        };

        stepsCollected.push(stepRecord);
        setCurrentGenerationSteps([...stepsCollected]);

        if (event.type === 'files_updated') {
          fetchFiles(sandboxId);
          refreshPreview();
          if (selectedFile) {
            loadFileContent(selectedFile, sandboxId).catch(() => {});
          }
        }
      });

      setMessages((prev) => [
        ...prev,
        {
          id: getNextId('ai'),
          role: 'assistant',
          text: stepsCollected.some((s) => s.type === 'files_updated')
            ? 'Application updated successfully! I have modified the relevant files and refreshed your live preview.'
            : 'AI response completed.',
          steps: stepsCollected,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setCurrentGenerationSteps([]);
    } catch (err) {
      console.error('AI error:', err);
      const errMsg = err.message || 'Failed to communicate with AI service';
      setErrorNotice(errMsg);

      setMessages((prev) => [
        ...prev,
        {
          id: getNextId('ai-err'),
          role: 'assistant',
          isError: true,
          text: `Error during AI generation: ${errMsg}`,
          steps: stepsCollected,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
      fetchFiles(sandboxId);
      refreshPreview();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="w-full h-full bg-white dark:bg-obsidian-950/95 border-l border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 select-none overflow-hidden transition-colors duration-150" data-purpose="ai-assistant-panel">
      {/* AI Header */}
      <div className="h-10 px-3.5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-xs dark:shadow-glow-indigo">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-white tracking-tight">AI Assistant</span>
          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
            SSE Stream
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            {isGenerating ? 'Generating...' : status === 'running' ? 'Ready' : 'Idle'}
          </span>
        </div>
      </div>

      {/* AI Chat Stream History */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.timestamp}</span>
                  <span className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">You</span>
                </div>
                <div className="max-w-[85%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-3 text-xs leading-relaxed shadow-xs">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-wider text-indigo-600 dark:text-violet-400 uppercase">Sandbox Copilot</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.timestamp}</span>
              </div>
              <div className={`rounded-2xl rounded-tl-sm p-3.5 shadow-xs leading-relaxed border transition-colors ${
                msg.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300'
                  : 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-obsidian-900/90 dark:border-slate-800/90 dark:text-slate-300'
              }`}>
                <div>{msg.text}</div>
                {msg.steps && msg.steps.length > 0 && (
                  <div className="mt-2.5 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    {msg.steps.map((st) => (
                      <div key={st.id} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{st.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Generating Steps */}
        {isGenerating && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-wider text-indigo-600 dark:text-violet-400 uppercase">Sandbox Copilot</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-indigo-600 dark:text-cyan-400" /> Generating
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-obsidian-900/90 border border-indigo-300 dark:border-indigo-500/30 rounded-2xl rounded-tl-sm p-3 text-slate-800 dark:text-slate-300 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 animate-spin" />
                <span>Processing prompt stream...</span>
              </div>
              {currentGenerationSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 pl-2">
                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{step.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Suggestions Section */}
        {messages.length <= 2 && (
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              Suggestions
            </div>
            <div className="space-y-1.5">
              {PROMPT_SUGGESTIONS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(item.text)}
                  className={`w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 ${item.hoverColor} text-slate-700 hover:text-slate-900 dark:bg-obsidian-900 dark:hover:bg-slate-800/60 dark:border-slate-800/80 dark:text-slate-300 dark:hover:text-white transition group flex items-center justify-between cursor-pointer`}
                >
                  <span className="text-xs">{item.text}</span>
                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {errorNotice && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorNotice}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Prompt Input Container */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-obsidian-950 shrink-0">
        <div className="relative rounded-xl bg-white dark:bg-obsidian-900 border border-slate-300 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:focus-within:border-indigo-500/80 dark:focus-within:ring-indigo-500/80 transition shadow-inner">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder="Ask AI to generate, redesign, or modify components..."
            className="w-full bg-transparent px-3 pt-2.5 pb-8 text-xs text-slate-800 placeholder-slate-400 dark:text-slate-200 dark:placeholder-slate-500 resize-none border-0 focus:ring-0 focus:outline-none"
          />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-slate-400">
              <button
                type="button"
                className="p-1 hover:text-slate-700 dark:hover:text-white rounded transition-colors cursor-pointer"
                title="Attach file context"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Shift+Enter for newline</span>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!inputPrompt.trim() || isGenerating}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                inputPrompt.trim() && !isGenerating
                  ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xs dark:shadow-glow-indigo hover:opacity-90 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
              }`}
              title="Send prompt"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
