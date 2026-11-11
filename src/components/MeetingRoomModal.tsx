import React, { useState } from 'react';
import { 
  Users, X, Play, Loader2, Sparkles, CheckCircle, 
  MessageSquare, FileText, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { AIAgent, Meeting, Task } from '../types';
import { playSound } from '../three/audio';

interface MeetingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Record<string, AIAgent>;
  existingMeetings: Meeting[];
  onMeetingCreated: (meeting: Meeting, newTasks: Task[]) => void;
  language: 'id' | 'en';
}

export const MeetingRoomModal: React.FC<MeetingRoomModalProps> = ({
  isOpen,
  onClose,
  agents,
  existingMeetings,
  onMeetingCreated,
  language,
}) => {
  const [agenda, setAgenda] = useState(
    language === 'id'
      ? 'Evaluasi strategi peluncuran produk 90 hari dan validasi model finansial runway'
      : 'Validate 90-day product launch strategy and approve financial runway models'
  );
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['ceo', 'cto', 'coo', 'cfo', 'cmo']);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(existingMeetings[0] || null);

  if (!isOpen) return null;

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleStartMeeting = async () => {
    if (!agenda.trim() || isSimulating) return;
    setIsSimulating(true);
    playSound.meetingChime();

    try {
      const response = await fetch('/api/meetings/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenda, participants: selectedAgents }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to simulate boardroom meeting');
      }

      setActiveMeeting(data.meeting);
      playSound.success();

      // Convert action items to actual tasks
      const createdTasks: Task[] = data.meeting.actionItems.map((act: any, idx: number) => ({
        id: `task-board-${Date.now()}-${idx}`,
        projectId: 'proj-1',
        title: act.description,
        description: `Generated from Boardroom meeting: "${agenda}"`,
        assigneeId: act.assignee,
        priority: 'high',
        status: 'pending',
        progress: 0,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        logs: [
          {
            timestamp: new Date().toISOString(),
            agentId: act.assignee,
            message: `Task established from boardroom action item: ${act.description}`,
            type: 'info',
          },
        ],
      }));

      onMeetingCreated(data.meeting, createdTasks);
    } catch (err: any) {
      alert(`Error starting boardroom session: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#0B0F1E] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>C-Suite Boardroom Meeting Hub</span>
                <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full font-mono">
                  Moderated by CEO
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Convene multi-agent discussions, debate trade-offs, extract binding decisions, and convert action items into tasks.
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

        {/* Meeting Body Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Left Column: Agenda & Participants */}
          <div className="md:col-span-4 p-5 space-y-5 bg-slate-950/40">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Meeting Agenda
              </label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                disabled={isSimulating}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500 transition resize-none font-sans"
                placeholder="Enter strategic meeting agenda..."
              />
            </div>

            {/* Invited Executives Checklist */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Participants ({selectedAgents.length}/5)
              </div>
              <div className="space-y-1.5">
                {Object.values(agents).map((agent) => {
                  const isInvited = selectedAgents.includes(agent.id);
                  return (
                    <button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      disabled={isSimulating}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-center justify-between border ${
                        isInvited
                          ? 'bg-slate-900/90 text-white border-white/20'
                          : 'bg-slate-950/60 text-slate-500 border-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: agent.avatarColor }}
                        />
                        <div>
                          <div className="font-bold">{agent.name}</div>
                          <div className="text-[10px] text-slate-400">{agent.role}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isInvited ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isInvited ? 'Invited' : 'Absent'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Meeting CTA */}
            <button
              onClick={handleStartMeeting}
              disabled={isSimulating || !agenda.trim() || selectedAgents.length === 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>C-Suite Deliberating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Call Boardroom to Order</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Transcript, Summary & Action Items */}
          <div className="md:col-span-8 p-6 flex flex-col space-y-5 bg-[#0A0D1A]">
            {activeMeeting ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {activeMeeting.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {activeMeeting.date} · {activeMeeting.durationMinutes} min runtime
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Adjourned</span>
                  </span>
                </div>

                {/* Transcripts List */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-none">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Meeting Transcripts</span>
                  </div>

                  {activeMeeting.transcripts.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold"
                          style={{ color: entry.avatarColor }}
                        >
                          {entry.speakerName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {entry.speech}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Summary & Key Decisions */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                  <div className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Executive Summary & Binding Decisions</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMeeting.summary}
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc mt-2">
                    {activeMeeting.keyDecisions.map((dec, i) => (
                      <li key={i}>{dec}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Items converted to Tasks */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Action Items Converted to Tasks</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeMeeting.actionItems.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-200 truncate pr-2">{act.description}</span>
                        <span className="uppercase text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                          {act.assignee}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Users className="w-12 h-12 text-slate-700 mb-3" />
                <div className="text-sm font-semibold text-slate-300">
                  Boardroom Standby
                </div>
                <div className="text-xs text-slate-500 max-w-sm mt-1">
                  Enter an agenda on the left and convene your AI executive team for a real-time strategic session.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Turn-limit guardrails active: No infinite loop risk</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Close Boardroom
          </button>
        </div>
      </div>
    </div>
  );
};
