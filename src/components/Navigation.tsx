import React from 'react';
import { 
  Building2, Users, FolderKanban, CheckSquare, MessageSquare, 
  BrainCircuit, FileText, CheckCircle2, BarChart3, Settings as SettingsIcon,
  Sparkles, ShieldCheck
} from 'lucide-react';

export type ActiveTab = 
  | 'office' 
  | 'dashboard' 
  | 'team' 
  | 'chat' 
  | 'projects' 
  | 'tasks' 
  | 'meetings' 
  | 'approvals' 
  | 'memory' 
  | 'documents' 
  | 'database'
  | 'analytics' 
  | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingApprovalsCount: number;
  unreadMessagesCount?: number;
  onLaunchWorkflow: () => void;
  onOpenAuth: () => void;
  currentUserEmail?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  onLaunchWorkflow,
  onOpenAuth,
  currentUserEmail,
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }> = [
    { id: 'office', label: 'Virtual Office 3D', icon: Building2 },
    { id: 'dashboard', label: 'Executive Overview', icon: BarChart3 },
    { id: 'team', label: 'My AI C-Suite', icon: Users },
    { id: 'chat', label: 'Executive Chat', icon: MessageSquare },
    { id: 'meetings', label: 'Boardroom Meetings', icon: Sparkles },
    { id: 'projects', label: 'Projects & Milestones', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks & Pipeline', icon: CheckSquare },
    { id: 'approvals', label: 'Approval Queue', icon: CheckCircle2, badge: pendingApprovalsCount, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
    { id: 'memory', label: 'AI Memory Core', icon: BrainCircuit },
    { id: 'documents', label: 'Deliverables Vault', icon: FileText },
    { id: 'database', label: 'Database & RLS', icon: ShieldCheck },
    { id: 'analytics', label: 'Tokens & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Company Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#0A0E1A] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen select-none">
      {/* Brand & Logo */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('office')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center">
                COFOUNDER <span className="text-cyan-400 ml-1">3D</span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-tight font-medium">
                AI Virtual Co-Founder
              </div>
            </div>
          </div>
        </div>

        {/* Master Workflow CTA */}
        <div className="p-3">
          <button
            onClick={onLaunchWorkflow}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 border border-white/15 transition transform hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Delegate Directive</span>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="px-2 py-1 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-none">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  active
                    ? 'bg-blue-600/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-blue-500 text-white'}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Founder Profile Footer */}
      <div 
        onClick={onOpenAuth}
        className="p-4 border-t border-white/10 bg-slate-950/40 hover:bg-slate-900/60 transition cursor-pointer"
        title="Account & Supabase Settings"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
            FD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {currentUserEmail || 'Founder & Owner'}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Auth & Supabase Active</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
