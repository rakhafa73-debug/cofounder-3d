import React, { useState } from 'react';
import { FolderKanban, Plus, Clock, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { Project, Task, AIAgent, AgentId } from '../types';
import { playSound } from '../three/audio';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  agents: Record<string, AIAgent>;
  onOpenTask: (task: Task) => void;
  onLaunchWorkflow: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  agents,
  onOpenTask,
  onLaunchWorkflow,
}) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-slate-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4 text-cyan-400" />
            <span>Company Roadmaps & Initiatives</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Projects & Executive Milestones
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Cross-functional programs orchestrated by Sophia Vance (CEO) and executed by the C-suite.
          </p>
        </div>

        <button
          onClick={onLaunchWorkflow}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center space-x-1.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Strategic Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((proj) => {
          const leadAgent = agents[proj.leadAgentId];
          const projectTasks = tasks.filter((t) => t.projectId === proj.id);

          return (
            <div
              key={proj.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{proj.title}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/15 text-cyan-300 border border-cyan-500/30">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">{proj.description}</p>
                </div>

                <div className="flex items-center space-x-3 text-xs shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Executive Lead</span>
                    <span className="font-bold text-white">{leadAgent?.name || proj.leadAgentId}</span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                    style={{ backgroundColor: leadAgent?.avatarColor || '#3B82F6' }}
                  >
                    {proj.leadAgentId.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Milestone Progress</span>
                  <span className="text-cyan-300 font-mono font-bold">{proj.progress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Associated Tasks */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Sprint Tasks ({projectTasks.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {projectTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onOpenTask(task)}
                      className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 transition cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="uppercase font-mono text-cyan-300">{task.assigneeId}</span>
                        <span className="text-slate-400">{task.status}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{task.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Due: {task.dueDate}</span>
                        <span className="font-mono text-emerald-400">{task.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
