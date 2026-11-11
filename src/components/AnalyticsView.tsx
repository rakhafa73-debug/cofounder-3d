import React from 'react';
import { 
  BarChart3, DollarSign, Activity, Zap, ShieldCheck, 
  TrendingUp, Users, Cpu, Server, CheckCircle2
} from 'lucide-react';
import { AIAgent } from '../types';

interface AnalyticsViewProps {
  agents: Record<string, AIAgent>;
  totalTokens: number;
  estimatedCost: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  agents,
  totalTokens,
  estimatedCost,
}) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>AI Inference & Operational Telemetry</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Resource Consumption & Efficiency
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time token audits, cost attribution per executive, and system uptime metrics.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-900/80 p-3 rounded-xl border border-white/10 shrink-0 font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Incurred Cost</span>
            <span className="text-base font-extrabold text-emerald-400 flex items-center">
              <DollarSign className="w-4 h-4 -mr-1" />
              {estimatedCost.toFixed(4)}
            </span>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-[10px] text-slate-400 block uppercase">Total Tokens</span>
            <span className="text-base font-extrabold text-cyan-300">
              {(totalTokens / 1000).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Average Agent Latency</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            380ms
          </div>
          <div className="text-[11px] text-emerald-400">
            Powered by Gemini 3.8 Flash
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Team Productivity Index</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            97.4%
          </div>
          <div className="text-[11px] text-slate-400">
            +3.2% from previous sprint
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg space-y-1">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Executive Uptime</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            99.98%
          </div>
          <div className="text-[11px] text-slate-400">
            Zero dropped worker tasks
          </div>
        </div>
      </div>

      {/* Per-Agent Efficiency & Token Breakdown Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Executive Performance & Cost Attribution</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">5 ACTIVE AGENTS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5 font-mono">
              <tr>
                <th className="p-4">Executive</th>
                <th className="p-4">Department</th>
                <th className="p-4">Tasks Executed</th>
                <th className="p-4">Tokens Used</th>
                <th className="p-4">Attributed Cost</th>
                <th className="p-4">Efficiency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.values(agents).map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: agent.avatarColor }}
                      />
                      <div>
                        <div className="font-bold text-white">{agent.name}</div>
                        <div className="text-[10px] text-slate-400">{agent.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-mono">{agent.department}</td>
                  <td className="p-4 font-mono font-bold text-white">{agent.metrics.tasksCompleted}</td>
                  <td className="p-4 font-mono text-cyan-300">{(agent.metrics.tokensUsed / 1000).toFixed(1)}k</td>
                  <td className="p-4 font-mono text-emerald-400">${(agent.metrics.tokensUsed * 0.0000015).toFixed(4)}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-200">{agent.metrics.efficiencyScore}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${agent.metrics.efficiencyScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
