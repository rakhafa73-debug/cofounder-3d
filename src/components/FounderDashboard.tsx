import React from 'react';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, 
  DollarSign, Activity, Sparkles, FolderKanban, 
  ArrowUpRight, ShieldCheck, Zap
} from 'lucide-react';
import { AIAgent, Project, Task, ApprovalRequest, ActivityLogItem } from '../types';

interface FounderDashboardProps {
  agents: Record<string, AIAgent>;
  projects: Project[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  activities: ActivityLogItem[];
  totalTokens: number;
  estimatedCost: number;
  onSelectAgent: (id: any) => void;
  onOpenTask: (task: Task) => void;
  onOpenApprovals: () => void;
  onLaunchWorkflow: () => void;
}

export const FounderDashboard: React.FC<FounderDashboardProps> = ({
  agents,
  projects,
  tasks,
  approvals,
  activities,
  totalTokens,
  estimatedCost,
  onSelectAgent,
  onOpenTask,
  onOpenApprovals,
  onLaunchWorkflow,
}) => {
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const runningTasks = tasks.filter((t) => t.status === 'working' || t.status === 'review').length;
  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-white/10 p-6 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>COFOUNDER 3D · Autonomous Enterprise Core</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Welcome back, Founder.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              All 5 AI C-suite executives are live in the 3D Virtual Office. Overall company execution efficiency is at <span className="text-emerald-400 font-semibold">97.4%</span>.
            </p>
          </div>

          <button
            onClick={onLaunchWorkflow}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition shrink-0 transform hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4" />
            <span>Launch Executive Directive</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active C-Suite */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Autonomous C-Suite</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            5 / 5 <span className="text-xs font-normal text-emerald-400 font-mono">100% ONLINE</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            CEO, CTO, COO, CFO, CMO active
          </div>
        </div>

        {/* Task Velocity */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Sprint Deliverables</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {completedTasks} <span className="text-xs font-normal text-slate-400">/ {tasks.length}</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center">
            <span>{runningTasks} in active execution</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={onOpenApprovals}
          className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg cursor-pointer hover:border-amber-500/40 transition"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Governance Queue</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">
            {pendingApprovals} <span className="text-xs font-normal text-slate-400 font-mono">PENDING</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Requires founder signoff</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* Inference & Cost */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>AI Token Consumption</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {(totalTokens / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Est. Cost: <span className="text-emerald-400 font-semibold">${estimatedCost.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* C-Suite Team Live Status Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>AI Executive Roster</span>
          </h3>
          <span className="text-xs text-slate-400">Click any card to inspect or consult</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.values(agents).map((agent) => (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/30 transition cursor-pointer flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md"
                    style={{ backgroundColor: agent.avatarColor }}
                  >
                    {agent.id.toUpperCase()}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </div>

                <div className="text-xs font-bold text-white truncate">
                  {agent.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {agent.role}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                <div className="text-[10px] text-cyan-300 font-mono">
                  {agent.roomLocation}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2">
                  {agent.currentActivity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Grid: Active Projects & Realtime Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Projects */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <span>Active Strategic Initiatives ({projects.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {proj.description}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                    Lead: {proj.leadAgentId}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Milestone Progress</span>
                    <span className="text-cyan-300 font-mono font-bold">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Target: {proj.targetDate}</span>
                  <span>Deliverables: {proj.deliverablesCount} generated</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Realtime Activity Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Executive Event Feed</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">LIVE SYNC</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-lg space-y-3 max-h-[380px] overflow-y-auto scrollbar-none">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                      <span>{act.action}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {act.detail}
                  </p>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">
                    Agent: {act.agentId}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Awaiting upcoming executive events...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
