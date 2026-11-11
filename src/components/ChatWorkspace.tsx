import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, Loader2, RotateCcw, 
  Terminal, Shield, FileCode, CheckCircle2, Copy, Check
} from 'lucide-react';
import { AIAgent, AgentId, ChatMessage } from '../types';
import { playSound } from '../three/audio';

interface ChatWorkspaceProps {
  agents: Record<string, AIAgent>;
  selectedAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  language: 'id' | 'en';
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  language,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      senderId: 'ceo',
      content: language === 'id' 
        ? 'Halo Founder. Saya Sophia Vance, CEO COFOUNDER 3D. Saya siap membantu strategi, dekomposisi proyek, dan koordinasi dengan CTO, COO, CFO, dan CMO. Apa yang ingin kita diskusikan hari ini?'
        : 'Welcome Founder. I am Sophia Vance, CEO of COFOUNDER 3D. I am here to steer corporate strategy, deconstruct initiatives, and coordinate David (CTO), Elena (COO), Marcus (CFO), and Aria (CMO). What shall we achieve today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAgent = agents[selectedAgentId] || agents.ceo;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    playSound.keystroke();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      senderId: 'founder',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          message: userText,
          conversationHistory: messages.slice(-6),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const agentReply: ChatMessage = {
        id: `agent-${Date.now()}`,
        senderId: selectedAgentId,
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentReply]);
      playSound.click();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          senderId: 'system',
          content: `Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-full bg-[#080B14] overflow-hidden">
      {/* Left Agent Selector Column */}
      <div className="w-72 bg-[#0B0F1C] border-r border-white/10 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Consult Executive</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            1-on-1 direct consultation with C-suite
          </p>
        </div>

        <div className="p-2 space-y-1.5 overflow-y-auto flex-1 scrollbar-none">
          {Object.values(agents).map((agent) => {
            const active = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent.id);
                  playSound.click();
                }}
                className={`w-full p-3 rounded-xl text-left transition flex items-center space-x-3 border ${
                  active
                    ? 'bg-blue-600/15 border-cyan-500/40 text-white shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-900/40 hover:bg-slate-800/60 border-white/5 text-slate-300'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0"
                  style={{ backgroundColor: agent.avatarColor }}
                >
                  {agent.id.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate flex items-center justify-between">
                    <span>{agent.name}</span>
                    <span className="text-[9px] font-mono uppercase text-cyan-400">
                      {agent.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {agent.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Model Spec Badge */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 text-xs">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Inference Engine</span>
          </div>
          <div className="font-mono text-cyan-300 text-xs font-semibold">
            {currentAgent.model}
          </div>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col h-full bg-[#070A14]">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md"
              style={{ backgroundColor: currentAgent.avatarColor }}
            >
              {currentAgent.id.toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <span>{currentAgent.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({currentAgent.role})
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  Online
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-lg">
                {currentAgent.currentActivity || currentAgent.specialization.join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  id: `reset-${Date.now()}`,
                  senderId: selectedAgentId,
                  content: `Conversation context refreshed with ${currentAgent.name}. Ready for new directives.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
              playSound.click();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset Context"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isFounder = msg.senderId === 'founder';
            const isSystem = msg.senderId === 'system';
            const agent = !isFounder && !isSystem ? agents[msg.senderId as AgentId] : null;

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isFounder ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md ${
                    isFounder
                      ? 'bg-gradient-to-tr from-amber-500 to-rose-500'
                      : isSystem
                      ? 'bg-slate-700'
                      : ''
                  }`}
                  style={agent ? { backgroundColor: agent.avatarColor } : {}}
                >
                  {isFounder ? <User className="w-4 h-4" /> : isSystem ? <Shield className="w-4 h-4" /> : agent?.id.toUpperCase()}
                </div>

                {/* Bubble Container */}
                <div className={`max-w-2xl group relative ${isFounder ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center space-x-2 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isFounder ? 'Founder' : agent ? agent.name : 'System'}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-[10px]">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isFounder
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10'
                        : isSystem
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-900/90 text-slate-100 border border-white/10 rounded-tl-none shadow-xl'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Copy Button */}
                  {!isFounder && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md"
                style={{ backgroundColor: currentAgent.avatarColor }}
              >
                {currentAgent.id.toUpperCase()}
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-cyan-400 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{currentAgent.name} is formulating response with {currentAgent.model}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${currentAgent.name} (${currentAgent.role})...`}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60 transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
