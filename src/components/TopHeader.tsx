import React from 'react';
import { Sparkles, Users, Search, Globe, DollarSign, Activity } from 'lucide-react';
import { ActiveTab } from './Navigation';

interface TopHeaderProps {
  activeTab: ActiveTab;
  onLaunchWorkflow: () => void;
  onOpenMeeting: () => void;
  language: 'id' | 'en';
  onToggleLanguage: () => void;
  totalTokens: number;
  estimatedCost: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onLaunchWorkflow,
  onOpenMeeting,
  language,
  onToggleLanguage,
  totalTokens,
  estimatedCost,
}) => {
  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    office: { title: 'Virtual Office 3D', subtitle: 'Live spatial headquarters with autonomous C-suite team' },
    dashboard: { title: 'Executive Overview', subtitle: 'Company health, task velocity, and team performance' },
    team: { title: 'My AI C-Suite', subtitle: 'Inspect, manage, and configure your autonomous executive co-founders' },
    chat: { title: 'Executive Chat', subtitle: 'Real-time multi-agent consultation powered by Gemini 3.8 Flash' },
    meetings: { title: 'Boardroom Meetings', subtitle: 'Convene C-suite debates, extract decisions, and mint tasks' },
    projects: { title: 'Projects & Milestones', subtitle: 'Active strategic company roadmaps and execution deliverables' },
    tasks: { title: 'Tasks & Pipeline', subtitle: 'Delegated executive tasks, dependencies, and execution logs' },
    approvals: { title: 'Approval Queue', subtitle: 'Human-in-the-loop governance for capital and deployments' },
    memory: { title: 'AI Memory Core', subtitle: 'Long-term corporate knowledge, decisions, and agent experiences' },
    documents: { title: 'Deliverables Vault', subtitle: 'Generated technical specs, financial models, SOPs, and campaigns' },
    database: { title: 'PostgreSQL & Supabase Architecture', subtitle: '22-table database schema with Row Level Security (RLS) policies' },
    analytics: { title: 'Tokens & Analytics', subtitle: 'Resource consumption, efficiency scores, and cost audits' },
    settings: { title: 'Company Settings', subtitle: '3D environment theme, sound FX, and autonomous parameters' },
  };

  const current = tabTitles[activeTab] || tabTitles.office;

  return (
    <header className="h-16 border-b border-white/10 bg-[#0A0E1A]/90 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
          <span>{current.title}</span>
          <span className="text-[10px] bg-blue-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">
            Autonomous
          </span>
        </h1>
        <p className="text-[11px] text-slate-400 hidden sm:block">
          {current.subtitle}
        </p>
      </div>

      {/* Center Search / Action bar */}
      <div className="flex items-center space-x-3">
        {/* Token Usage Pill */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 font-mono">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>{(totalTokens / 1000).toFixed(1)}k tokens</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center">
            <DollarSign className="w-3 h-3 -mr-0.5" />
            {estimatedCost.toFixed(4)}
          </span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 flex items-center space-x-1.5 transition"
          title="Toggle Language (English / Bahasa Indonesia)"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'en' ? 'EN' : 'ID'}</span>
        </button>

        {/* Boardroom Meeting Shortcut */}
        <button
          onClick={onOpenMeeting}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition"
        >
          <Users className="w-3.5 h-3.5 text-violet-400" />
          <span>Boardroom</span>
        </button>

        {/* Delegate Directive CTA */}
        <button
          onClick={onLaunchWorkflow}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Instruct CEO</span>
        </button>
      </div>
    </header>
  );
};
