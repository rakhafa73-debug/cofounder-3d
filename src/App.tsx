/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { TopHeader } from './components/TopHeader';
import { VirtualOfficeCanvas } from './three/VirtualOfficeCanvas';
import { FounderDashboard } from './components/FounderDashboard';
import { TeamView } from './components/TeamView';
import { ChatWorkspace } from './components/ChatWorkspace';
import { TaskBoard } from './components/TaskBoard';
import { ProjectsView } from './components/ProjectsView';
import { ApprovalsView } from './components/ApprovalsView';
import { MemoryManager } from './components/MemoryManager';
import { DocumentsView } from './components/DocumentsView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { AnalyticsView } from './components/AnalyticsView';
import { DirectiveModal } from './components/DirectiveModal';
import { MeetingRoomModal } from './components/MeetingRoomModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { AppUser, getActiveSession } from './lib/supabase';
import { 
  INITIAL_AGENTS, INITIAL_PROJECTS, INITIAL_TASKS, 
  INITIAL_MEETINGS, INITIAL_MEMORIES, INITIAL_APPROVALS, 
  INITIAL_DOCUMENTS, INITIAL_SETTINGS 
} from './data/initialData';
import { AIAgent, AgentId, Task, Project, Meeting, MemoryItem, ApprovalRequest, TaskStatus, ActivityLogItem } from './types';
import { playSound } from './three/audio';

export default function App() {
  // Core Application State
  const [activeTab, setActiveTab] = useState<ActiveTab>('office');
  const [agents, setAgents] = useState<Record<string, AIAgent>>(INITIAL_AGENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // Stats
  const [totalTokens, setTotalTokens] = useState(972100);
  const [estimatedCost, setEstimatedCost] = useState(1.458);

  // Activities Log
  const [activities, setActivities] = useState<ActivityLogItem[]>([
    {
      id: 'act-1',
      timestamp: new Date().toISOString(),
      agentId: 'ceo',
      action: 'Milestone Validated',
      detail: 'Approved 90-day master execution sprint roadmap',
      type: 'milestone',
    },
    {
      id: 'act-2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      agentId: 'cto',
      action: 'PostgreSQL Schema Committed',
      detail: 'Generated 22-table database blueprint with RLS security policies',
      type: 'code',
    },
    {
      id: 'act-3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      agentId: 'cfo',
      action: 'Runway Model Verified',
      detail: 'Calculated 18-month financial runway with 84% target gross margins',
      type: 'system',
    },
  ]);

  // Modals & Navigation Selectors
  const [currentUser, setCurrentUser] = useState<AppUser | null>(getActiveSession());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDirectiveOpen, setIsDirectiveOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inspectingAgent, setInspectingAgent] = useState<AIAgent | null>(null);
  const [activeChatAgentId, setActiveChatAgentId] = useState<AgentId>('ceo');

  // Multi-Agent Workflow Completion Callback
  const handleWorkflowComplete = (newProject: Project, newTasks: Task[]) => {
    setProjects((prev) => [newProject, ...prev]);
    setTasks((prev) => [...newTasks, ...prev]);
    setTotalTokens((prev) => prev + 1250);
    setEstimatedCost((prev) => prev + 0.002);

    // Update agent statuses to 'working' in 3D office
    setAgents((prev) => {
      const copy = { ...prev };
      copy.cto.status = 'working';
      copy.cmo.status = 'working';
      copy.cfo.status = 'working';
      copy.coo.status = 'working';
      return copy;
    });

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agentId: 'ceo',
        action: 'Executive Directive Deployed',
        detail: `Decomposed and delegated project "${newProject.title}"`,
        type: 'milestone',
      },
      ...prev,
    ]);
  };

  // Boardroom Meeting Completion Callback
  const handleMeetingCreated = (newMeeting: Meeting, createdTasks: Task[]) => {
    setMeetings((prev) => [newMeeting, ...prev]);
    setTasks((prev) => [...createdTasks, ...prev]);
    setTotalTokens((prev) => prev + 2100);
    setEstimatedCost((prev) => prev + 0.0035);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agentId: 'ceo',
        action: 'Boardroom Adjourned',
        detail: `Concluded strategic session on "${newMeeting.agenda.slice(0, 30)}..."`,
        type: 'meeting',
      },
      ...prev,
    ]);
  };

  // Task Status Update
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, progress: newStatus === 'completed' ? 100 : t.progress } : t))
    );
  };

  // Add Task
  const handleAddTask = (newTask: Partial<Task>) => {
    setTasks((prev) => [newTask as Task, ...prev]);
  };

  // Decide Approval
  const handleDecideApproval = (id: string, status: 'approved' | 'rejected', notes?: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, decidedAt: new Date().toISOString(), reviewerNotes: notes } : a))
    );
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agentId: 'ceo',
        action: `Approval ${status === 'approved' ? 'Granted' : 'Declined'}`,
        detail: `Founder decided approval request #${id.slice(-4)}`,
        type: 'approval',
      },
      ...prev,
    ]);
  };

  // Add Memory
  const handleAddMemory = (newMem: Partial<MemoryItem>) => {
    setMemories((prev) => [newMem as MemoryItem, ...prev]);
  };

  // Delete Memory
  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  // Emergency Stop Handler
  const handleEmergencyStop = () => {
    setAgents((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        copy[k as AgentId].status = 'idle';
      });
      return copy;
    });
    alert('EMERGENCY STOP ACTIVATED: All agent worker loops placed on standby.');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080B14] text-slate-100 font-sans">
      {/* 1. Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveTab(tab);
            playSound.click();
          }
        }}
        pendingApprovalsCount={approvals.filter((a) => a.status === 'pending').length}
        onLaunchWorkflow={() => setIsDirectiveOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUserEmail={currentUser?.email}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onLaunchWorkflow={() => setIsDirectiveOpen(true)}
          onOpenMeeting={() => setIsMeetingOpen(true)}
          language={settings.language}
          onToggleLanguage={() => {
            const nextLang = settings.language === 'en' ? 'id' : 'en';
            setSettings({ ...settings, language: nextLang });
            playSound.click();
          }}
          totalTokens={totalTokens}
          estimatedCost={estimatedCost}
        />

        {/* View Switcher */}
        <main className="flex-1 relative overflow-hidden bg-[#070A14]">
          {activeTab === 'office' && (
            <VirtualOfficeCanvas
              agents={agents}
              settings={settings}
              onSelectAgent={(agentId) => {
                setInspectingAgent(agents[agentId]);
              }}
              onOpenMeetingRoom={() => setIsMeetingOpen(true)}
              onUpdateSettings={(newSet) => setSettings({ ...settings, ...newSet })}
              activeExecutiveWorkflow={tasks.some((t) => t.status === 'working')}
            />
          )}

          {activeTab === 'dashboard' && (
            <FounderDashboard
              agents={agents}
              projects={projects}
              tasks={tasks}
              approvals={approvals}
              activities={activities}
              totalTokens={totalTokens}
              estimatedCost={estimatedCost}
              onSelectAgent={(id) => {
                setInspectingAgent(agents[id]);
              }}
              onOpenTask={(task) => {
                setActiveTab('tasks');
              }}
              onOpenApprovals={() => setActiveTab('approvals')}
              onLaunchWorkflow={() => setIsDirectiveOpen(true)}
            />
          )}

          {activeTab === 'team' && (
            <TeamView
              agents={agents}
              onInspectAgent={(agent) => setInspectingAgent(agent)}
              onOpenChat={(id) => {
                setActiveChatAgentId(id);
                setActiveTab('chat');
              }}
            />
          )}

          {activeTab === 'chat' && (
            <ChatWorkspace
              agents={agents}
              selectedAgentId={activeChatAgentId}
              onSelectAgent={(id) => setActiveChatAgentId(id)}
              language={settings.language}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              agents={agents}
              onOpenTask={() => setActiveTab('tasks')}
              onLaunchWorkflow={() => setIsDirectiveOpen(true)}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              agents={agents}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddTask={handleAddTask}
            />
          )}

          {activeTab === 'meetings' && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                  <span className="text-2xl font-bold">🏛️</span>
                </div>
                <h3 className="text-lg font-bold text-white">C-Suite Executive Boardroom</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Convene Sophia Vance (CEO), David Chen (CTO), Elena Rostova (COO), Marcus Sterling (CFO), and Aria Thorne (CMO) to resolve cross-functional agendas and establish binding company decisions.
                </p>
                <button
                  onClick={() => setIsMeetingOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition"
                >
                  Convene Live Boardroom Session
                </button>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView
              approvals={approvals}
              agents={agents}
              onDecideApproval={handleDecideApproval}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryManager
              memories={memories}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              agents={agents}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseSchemaView />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              agents={agents}
              totalTokens={totalTokens}
              estimatedCost={estimatedCost}
            />
          )}
        </main>
      </div>

      {/* 3. Global Interactive Modals */}

      {/* Supabase Authentication & Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChanged={(u) => setCurrentUser(u)}
      />

      {/* Autonomous Directive Modal */}
      <DirectiveModal
        isOpen={isDirectiveOpen}
        onClose={() => setIsDirectiveOpen(false)}
        onWorkflowComplete={handleWorkflowComplete}
        language={settings.language}
      />

      {/* Boardroom Meeting Modal */}
      <MeetingRoomModal
        isOpen={isMeetingOpen}
        onClose={() => setIsMeetingOpen(false)}
        agents={agents}
        existingMeetings={meetings}
        onMeetingCreated={handleMeetingCreated}
        language={settings.language}
      />

      {/* Agent Detail / Configuration Drawer */}
      <AgentDetailModal
        agent={inspectingAgent}
        onClose={() => setInspectingAgent(null)}
        onOpenChat={(id) => {
          setActiveChatAgentId(id);
          setActiveTab('chat');
        }}
        onUpdateAgent={(updated) => {
          setAgents((prev) => ({ ...prev, [updated.id]: updated }));
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings({ ...settings, ...newSet })}
        onEmergencyStop={handleEmergencyStop}
      />
    </div>
  );
}
