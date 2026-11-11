import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Filter, Clock, AlertCircle, 
  CheckCircle2, FileText, ChevronRight, X, User
} from 'lucide-react';
import { Task, TaskStatus, AIAgent, AgentId } from '../types';
import { playSound } from '../three/audio';

interface TaskBoardProps {
  tasks: Task[];
  agents: Record<string, AIAgent>;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (newTask: Partial<Task>) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  agents,
  onUpdateTaskStatus,
  onAddTask,
}) => {
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState<AgentId>('ceo');

  const columns: Array<{ id: TaskStatus; label: string; color: string }> = [
    { id: 'pending', label: 'Pending', color: 'border-slate-500' },
    { id: 'working', label: 'In Execution', color: 'border-blue-500' },
    { id: 'review', label: 'Review / QA', color: 'border-amber-500' },
    { id: 'completed', label: 'Completed', color: 'border-emerald-500' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (filterAgent !== 'all' && t.assigneeId !== filterAgent) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      id: `task-${Date.now()}`,
      projectId: 'proj-1',
      title: newTitle.trim(),
      description: newDesc.trim() || 'Executive assigned task',
      assigneeId: newAssignee,
      priority: 'high',
      status: 'pending',
      progress: 0,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          agentId: newAssignee,
          message: 'Task created and dispatched to agent queue',
          type: 'info',
        },
      ],
    });

    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
    playSound.success();
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-4 overflow-hidden">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>Executive Task Pipeline</span>
            <span className="text-xs text-slate-400 font-normal">({tasks.length} total)</span>
          </div>

          {/* Filter by Agent */}
          <div className="flex items-center space-x-1.5 pl-3 border-l border-white/10">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Executives</option>
              {Object.values(agents).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-y-auto pb-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="rounded-2xl bg-slate-900/40 border border-white/10 p-3 flex flex-col min-h-[400px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 px-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {col.label}
                </span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Stack */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-none">
                {colTasks.map((task) => {
                  const agent = agents[task.assigneeId];
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/40 transition cursor-pointer space-y-2.5 shadow-lg group"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className="text-[9px] uppercase font-bold font-mono px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: agent?.avatarColor || '#3B82F6' }}
                        >
                          {task.assigneeId}
                        </span>

                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition line-clamp-2">
                        {task.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{task.dueDate}</span>
                        </span>

                        <span className="text-cyan-400 font-mono font-bold">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-600 border border-dashed border-white/5 rounded-xl">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Drawer/Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D1222] border border-white/15 p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <div className="text-[10px] uppercase font-mono text-cyan-400 mb-1">
                  Task ID: {selectedTask.id} · Assignee: {selectedTask.assigneeId.toUpperCase()}
                </div>
                <h3 className="text-base font-bold text-white">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedTask.description}
            </p>

            {/* Change Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Update Status
              </label>
              <div className="grid grid-cols-4 gap-2">
                {columns.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onUpdateTaskStatus(selectedTask.id, c.id);
                      setSelectedTask({ ...selectedTask, status: c.id });
                      playSound.click();
                    }}
                    className={`p-2 rounded-xl text-xs font-semibold border transition ${
                      selectedTask.status === c.id
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Logs */}
            {selectedTask.logs && selectedTask.logs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Agent Execution Log
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-2 text-xs font-mono">
                  {selectedTask.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-300">
                      <span className="text-cyan-400">&gt;</span>
                      <div>
                        <span className="text-slate-500">[{log.timestamp.slice(11, 19)}]</span>{' '}
                        <span className="text-indigo-300 uppercase">{log.agentId}:</span>{' '}
                        <span>{log.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result Deliverable if complete */}
            {selectedTask.result && (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deliverable Output</span>
                </div>
                <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedTask.result}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D1222] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Create Executive Task</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details and deliverables expected..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value as AgentId)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none"
                >
                  {Object.values(agents).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Create & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
