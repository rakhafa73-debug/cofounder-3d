import React, { useState } from 'react';
import { 
  X, Bot, Shield, Wrench, Sparkles, Sliders, 
  MessageSquare, CheckCircle2, Cpu, Activity
} from 'lucide-react';
import { AIAgent, AgentId } from '../types';
import { playSound } from '../three/audio';

interface AgentDetailModalProps {
  agent: AIAgent | null;
  onClose: () => void;
  onOpenChat: (agentId: AgentId) => void;
  onUpdateAgent?: (updated: AIAgent) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onOpenChat,
  onUpdateAgent,
}) => {
  if (!agent) return null;

  const [prompt, setPrompt] = useState(agent.systemPrompt);
  const [temperature, setTemperature] = useState(agent.temperature);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onUpdateAgent) {
      onUpdateAgent({
        ...agent,
        systemPrompt: prompt,
        temperature,
      });
    }
    setIsSaved(true);
    playSound.success();
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0C101F] border border-white/15 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-lg shadow-xl shrink-0"
              style={{ backgroundColor: agent.avatarColor }}
            >
              {agent.id.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{agent.name}</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/15 text-cyan-300 border border-cyan-500/30">
                  {agent.id}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{agent.title}</p>
              <p className="text-[11px] text-slate-400">{agent.department} · Station: {agent.roomLocation}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onOpenChat(agent.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Chat</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Personality & Specialization */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Executive Persona & Demeanor
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {agent.personality}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Specialization Areas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.specialization.map((spec, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-mono"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Registered Tools ({agent.tools.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.map((tool, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Execution Performance Metrics
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-950/60">
              <div className="text-[10px] text-slate-400 uppercase">Tasks Completed</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">{agent.metrics.tasksCompleted}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60">
              <div className="text-[10px] text-slate-400 uppercase">Tokens Incurred</div>
              <div className="text-base font-extrabold text-cyan-300 font-mono mt-0.5">{(agent.metrics.tokensUsed / 1000).toFixed(1)}k</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60">
              <div className="text-[10px] text-slate-400 uppercase">Efficiency Score</div>
              <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">{agent.metrics.efficiencyScore}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60">
              <div className="text-[10px] text-slate-400 uppercase">Uptime</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">{agent.metrics.uptimePercent}%</div>
            </div>
          </div>
        </div>

        {/* System Prompt Tuning (Human-in-the-Loop) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>System Prompt Instruction & Behavioral Alignment</span>
            </label>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>Temperature: {temperature}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-24 accent-blue-500"
              />
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Save Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[11px] text-slate-400">
            Model: <span className="font-mono text-cyan-300">{agent.model}</span>
          </span>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : null}
            <span>{isSaved ? 'Parameters Saved' : 'Save Alignment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
