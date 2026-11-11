import React from 'react';
import { Users, Bot, MessageSquare, Wrench, Sparkles, Sliders } from 'lucide-react';
import { AIAgent, AgentId } from '../types';
import { playSound } from '../three/audio';

interface TeamViewProps {
  agents: Record<string, AIAgent>;
  onInspectAgent: (agent: AIAgent) => void;
  onOpenChat: (agentId: AgentId) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  agents,
  onInspectAgent,
  onOpenChat,
}) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Autonomous C-Suite Executive Leadership</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            My AI Co-Founder Team
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            5 specialized corporate officers operating inside the 3D Virtual Office with isolated tool registries.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-cyan-300">
          5 / 5 EXECUTIVES ONLINE
        </div>
      </div>

      {/* Agents Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.values(agents).map((agent) => (
          <div
            key={agent.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/30 transition shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-white text-base shadow-md"
                  style={{ backgroundColor: agent.avatarColor }}
                >
                  {agent.id.toUpperCase()}
                </div>

                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>{agent.status}</span>
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>{agent.name}</span>
                  <span className="text-xs text-slate-400 font-normal">({agent.id.toUpperCase()})</span>
                </h3>
                <div className="text-xs text-cyan-400 font-medium">{agent.role}</div>
                <div className="text-[11px] text-slate-400">{agent.department} · {agent.roomLocation}</div>
              </div>

              <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                {agent.personality}
              </p>

              {/* Specializations */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                <div className="text-[10px] uppercase font-semibold text-slate-400">
                  Core Specializations
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.specialization.slice(0, 3).map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center space-x-2">
              <button
                onClick={() => {
                  onInspectAgent(agent);
                  playSound.click();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/5 transition flex items-center justify-center space-x-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure</span>
              </button>
              <button
                onClick={() => {
                  onOpenChat(agent.id);
                  playSound.click();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Consult</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
