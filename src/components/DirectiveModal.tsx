import React, { useState } from 'react';
import { Sparkles, X, Loader2, ArrowRight, CheckCircle2, Shield, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../three/audio';

interface DirectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowComplete: (project: any, tasks: any[]) => void;
  language: 'id' | 'en';
}

export const DirectiveModal: React.FC<DirectiveModalProps> = ({
  isOpen,
  onClose,
  onWorkflowComplete,
  language,
}) => {
  const [prompt, setPrompt] = useState(
    language === 'id'
      ? 'Buatkan strategi bisnis startup SaaS selama 90 hari.'
      : 'Create a 90-day comprehensive SaaS launch strategy.'
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    language === 'id' ? 'Buatkan strategi bisnis startup SaaS selama 90 hari.' : 'Create a 90-day comprehensive SaaS launch strategy.',
    language === 'id' ? 'Rancang arsitektur multi-tenant PostgreSQL dengan RLS dan AI memory' : 'Architect multi-tenant PostgreSQL with RLS and AI memory',
    language === 'id' ? 'Model finansial runway 18 bulan dan tier harga langganan' : '18-month financial runway model & SaaS pricing tiers',
    language === 'id' ? 'Strategi kampanye peluncuran viral di Product Hunt & LinkedIn' : 'Viral Product Hunt & LinkedIn launch campaign playbook',
  ];

  const handleExecute = async () => {
    if (!prompt.trim() || isExecuting) return;
    setIsExecuting(true);
    setResult(null);
    playSound.click();

    try {
      setCurrentStep('AI CEO Sophia Vance is analyzing founder directive...');
      await new Promise((r) => setTimeout(r, 600));

      setCurrentStep('Decomposing strategic initiatives into multi-agent task pipeline...');
      const response = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ founderInstruction: prompt }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Workflow execution failed');
      }

      setCurrentStep('Dispatching tasks to CTO, CMO, CFO, and COO in 3D Virtual Office...');
      await new Promise((r) => setTimeout(r, 500));

      setResult(data);
      playSound.success();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });

      onWorkflowComplete(data.project, data.tasks);
    } catch (err: any) {
      alert(`Error executing directive: ${err.message}`);
    } finally {
      setIsExecuting(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D1324] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Autonomous Executive Directive</span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                  Multi-Agent
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                AI CEO Sophia Vance decomposes your prompt and delegates deliverables across the C-suite.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!result ? (
            <>
              {/* Instruction Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Founder Directive / Strategic Goal
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isExecuting}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/15 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 transition resize-none font-sans"
                  placeholder="Describe your vision, product roadmap, or strategic initiative..."
                />
              </div>

              {/* Quick Template Prompts */}
              <div>
                <div className="text-xs font-medium text-slate-400 mb-2">
                  Recommended Founder Directives:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(qp)}
                      disabled={isExecuting}
                      className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 text-left text-xs text-slate-300 hover:text-white transition flex items-start space-x-2"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{qp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Status Indicator */}
              {isExecuting && (
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center space-x-3 text-cyan-300 text-xs animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{currentStep}</span>
                </div>
              )}
            </>
          ) : (
            /* Result Summary View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white">
                    Directive Successfully Orchestrated!
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {result.ceoSummary}
                  </div>
                </div>
              </div>

              {/* Tasks Breakdown list */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Delegated C-Suite Deliverables ({result.tasks.length})
                </div>
                <div className="space-y-2">
                  {result.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-2">
                          <span className="uppercase text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                            {task.assigneeId}
                          </span>
                          <span>{task.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {task.description}
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded font-medium border border-amber-500/20 shrink-0">
                        In Progress (3D Office)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Human-in-the-loop governance active</span>
          </div>

          <div className="flex items-center space-x-2">
            {!result ? (
              <>
                <button
                  onClick={onClose}
                  disabled={isExecuting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !prompt.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mobilizing Team...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-3.5 h-3.5" />
                      <span>Execute Directive</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
              >
                View in 3D Office & Tasks
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
