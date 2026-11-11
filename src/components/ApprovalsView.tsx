import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  DollarSign, Clock, Check, ArrowRight, User
} from 'lucide-react';
import { ApprovalRequest, AIAgent } from '../types';
import { playSound } from '../three/audio';

interface ApprovalsViewProps {
  approvals: ApprovalRequest[];
  agents: Record<string, AIAgent>;
  onDecideApproval: (id: string, status: 'approved' | 'rejected', notes?: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  agents,
  onDecideApproval,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const filtered = approvals.filter((a) => {
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'resolved') return a.status !== 'pending';
    return true;
  });

  const handleAction = (id: string, decision: 'approved' | 'rejected') => {
    onDecideApproval(id, decision);
    if (decision === 'approved') {
      playSound.success();
    } else {
      playSound.click();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Human-in-the-Loop Governance Queue</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                Security Perimeter
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Autonomous agents are bound by corporate policy. External financial transactions, production deployments, and public campaigns mandate founder authorization.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-white/10 shrink-0">
          {(['all', 'pending', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                filter === tab ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals Stack */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const agent = agents[item.requestedBy];
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition shadow-xl space-y-4 ${
                item.status === 'pending'
                  ? 'bg-slate-900/80 border-amber-500/30 hover:border-amber-500/50'
                  : item.status === 'approved'
                  ? 'bg-slate-900/40 border-emerald-500/20'
                  : 'bg-slate-900/40 border-rose-500/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0"
                    style={{ backgroundColor: agent?.avatarColor || '#3B82F6' }}
                  >
                    {item.requestedBy.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.category}
                      </span>
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      Requested by {agent?.name} ({agent?.role}) · {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {item.status === 'pending' ? (
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Founder Decision</span>
                    </span>
                  ) : item.status === 'approved' ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Authorized by Founder</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-200 leading-relaxed pl-12">
                {item.description}
              </p>

              {/* Assessment Details Box */}
              <div className="ml-12 p-3.5 rounded-xl bg-slate-950/60 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {item.details.financialAmount && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Financial Impact</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      ${item.details.financialAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Scope</span>
                  <span className="text-slate-200 text-xs truncate block">{item.details.resourceScope || 'General Operation'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Risk Assessment</span>
                  <span className="text-slate-300 text-xs">{item.details.riskAssessment || 'Audited by C-Suite'}</span>
                </div>
              </div>

              {/* Action Buttons for Pending Items */}
              {item.status === 'pending' && (
                <div className="pl-12 flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => handleAction(item.id, 'rejected')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 text-xs font-semibold border border-white/10 hover:border-rose-500/30 transition flex items-center space-x-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline & Request Revision</span>
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'approved')}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Authorize Execution</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-xs">
            No approval requests in this filter category.
          </div>
        )}
      </div>
    </div>
  );
};
