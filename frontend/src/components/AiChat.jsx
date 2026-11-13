import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  FileSearch,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight,
  Wand2
} from 'lucide-react';
import { useSandbox } from '../context/useSandbox';
import { invokeAiStream } from '../services/api';

const PROMPT_SUGGESTIONS = [
  'Change the colours of font and theme of the page.',
  'Add a modern Hero section with a gradient call-to-action.',
  'Create a responsive Navbar with a logo and navigation links.',
  'Add an interactive Counter component with state.',
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

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentGenerationSteps, isGenerating]);

  // Handle sending user prompt
  const handleSend = async (messageText = inputPrompt) => {
    const textToSend = messageText.trim();
    if (!textToSend || isGenerating) return;

    if (!sandboxId || status !== 'running') {
      setErrorNotice('Please start the sandbox first to enable AI assistance.');
      setTimeout(() => setErrorNotice(null), 3500);
      return;
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
      await invokeAiStream(sandboxId, textToSend, (event) => {
        // Discard empty lines as requested in spec
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

        // When files are updated successfully, trigger auto-refresh of file list and preview
        if (event.type === 'files_updated') {
          fetchFiles(sandboxId);
          refreshPreview();
          if (selectedFile) {
            loadFileContent(selectedFile, sandboxId).catch(() => {});
          }
        }
      });

      // Successful completion
      setMessages((prev) => [
        ...prev,
        {
          id: getNextId('ai'),
          role: 'assistant',
          text: stepsCollected.some(s => s.type === 'files_updated')
            ? 'Application updated successfully! I have modified the relevant files and reloaded your live preview.'
            : 'AI response completed.',
          steps: stepsCollected,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setCurrentGenerationSteps([]);
    } catch (err) {
      console.error('AI invocation error:', err);
      const errMsg = err.message || 'Failed to communicate with AI endpoint';
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
      // Final sync of files and preview in case the stream ended without explicit event
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
    <aside className="w-full h-full bg-white dark:bg-slate-900/90 flex flex-col select-none transition-colors duration-200">
      {/* Header */}
      <div className="h-10 px-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">AI Assistant</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700">
            SSE Stream
          </span>
        </div>

        {status === 'running' ? (
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">Offline</span>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 select-text">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1.5">
            {/* Message Bubble */}
            <div className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                  msg.role === 'user'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    : msg.isError
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Text Body */}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
                    : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`mt-1 text-[10px] text-right ${
                    msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>

            {/* Completed Generation Steps Card (if any) */}
            {msg.steps && msg.steps.length > 0 && (
              <div className="ml-8 mr-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-indigo-500" />
                  <span>Execution Log</span>
                </div>
                {msg.steps.map((step) => (
                  <div key={step.id} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                    {step.type === 'files_updated' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : step.type === 'files_read' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    ) : step.type === 'reading_files' ? (
                      <FileSearch className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    ) : step.type === 'timestamp' ? (
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className="font-mono">{step.message}</span>
                      {step.files && step.files.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {step.files.map((f, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] border border-indigo-200 dark:border-indigo-800"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Live Generation Progress Card */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>AI is generating and applying changes...</span>
              </div>
            </div>

            {/* Live SSE Steps Card */}
            {currentGenerationSteps.length > 0 && (
              <div className="ml-8 mr-2 bg-slate-50 dark:bg-slate-900 border border-indigo-200/60 dark:border-indigo-900/50 rounded-lg p-2.5 space-y-1.5 text-[11px] shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>Processing Live Events</span>
                </div>
                {currentGenerationSteps.map((step) => (
                  <div key={step.id} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 animate-fadeIn">
                    {step.type === 'files_updated' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : step.type === 'files_read' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    ) : step.type === 'reading_files' ? (
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5 animate-spin" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className="font-mono">{step.message}</span>
                      {step.files && step.files.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {step.files.map((f, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] border border-indigo-200 dark:border-indigo-800"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts (when idle) */}
      {messages.length <= 2 && status === 'running' && (
        <div className="px-3 pb-2 pt-1">
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            Suggestions
          </div>
          <div className="flex flex-col gap-1">
            {PROMPT_SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion)}
                className="text-left text-[11px] p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors truncate"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorNotice && (
        <div className="mx-3 mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{errorNotice}</span>
        </div>
      )}

      {/* Chat Input Area */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
        {status !== 'running' ? (
          <div className="text-center py-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Start the sandbox environment to enable AI chat.
            </p>
            <button
              onClick={startSandbox}
              disabled={status === 'starting'}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
            >
              Start Sandbox
            </button>
          </div>
        ) : (
          <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Ask AI to generate, redesign, or modify components (e.g., 'Change theme to dark blue', 'Add a counter')..."
              className="w-full text-xs p-2.5 pb-8 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none"
            />
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 hidden sm:inline">Shift+Enter for newline</span>
              <button
                onClick={() => handleSend()}
                disabled={!inputPrompt.trim() || isGenerating}
                className={`p-1.5 rounded-lg text-white transition-all ${
                  inputPrompt.trim() && !isGenerating
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-500/30 active:scale-95'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
