export type AgentId = 'ceo' | 'cto' | 'coo' | 'cfo' | 'cmo';

export type AgentStatus = 
  | 'idle' 
  | 'thinking' 
  | 'working' 
  | 'meeting' 
  | 'waiting_approval' 
  | 'completed' 
  | 'error';

export interface AgentMetrics {
  tasksCompleted: number;
  tokensUsed: number;
  efficiencyScore: number; // 0 - 100
  uptimePercent: number;
  lastActive: string;
}

export interface AIAgent {
  id: AgentId;
  name: string;
  role: string;
  title: string;
  department: string;
  avatarColor: string;
  secondaryColor: string;
  personality: string;
  specialization: string[];
  responsibilities: string[];
  systemPrompt: string;
  provider: 'gemini' | 'openai' | 'anthropic';
  model: string;
  temperature: number;
  tools: string[];
  permissions: string[];
  status: AgentStatus;
  currentActivity?: string;
  roomLocation: string;
  metrics: AgentMetrics;
}

export type TaskStatus = 
  | 'backlog' 
  | 'pending' 
  | 'working' 
  | 'review' 
  | 'approval_required' 
  | 'completed' 
  | 'failed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskLog {
  timestamp: string;
  agentId: AgentId;
  message: string;
  type: 'info' | 'code' | 'thought' | 'tool_call' | 'approval_request' | 'result';
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: AgentId;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0 - 100
  dueDate: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
  logs: TaskLog[];
  result?: string;
  deliverableType?: 'document' | 'code' | 'tech_spec' | 'financial_model' | 'sop' | 'campaign';
  requiresApproval?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  progress: number;
  leadAgentId: AgentId;
  budgetAllocated?: number;
  startDate: string;
  targetDate: string;
  taskIds: string[];
  deliverablesCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: AgentId | 'founder' | 'system';
  receiverId?: AgentId | 'all';
  content: string;
  timestamp: string;
  thoughtProcess?: string;
  toolCalls?: Array<{
    tool: string;
    params: any;
    result?: any;
  }>;
  suggestedActions?: string[];
}

export interface MeetingTranscriptEntry {
  id: string;
  agentId: AgentId | 'founder';
  speakerName: string;
  speech: string;
  timestamp: string;
  avatarColor: string;
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  date: string;
  durationMinutes: number;
  participants: AgentId[];
  transcripts: MeetingTranscriptEntry[];
  summary?: string;
  keyDecisions: string[];
  actionItems: Array<{
    id: string;
    description: string;
    assignee: AgentId;
    convertedToTaskId?: string;
  }>;
}

export type MemoryType = 'short_term' | 'long_term' | 'project' | 'decision' | 'agent';

export interface MemoryItem {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  agentId?: AgentId | 'company';
  projectId?: string;
  relevanceScore: number; // 1 - 5
  tags: string[];
  createdAt: string;
  updatedAt: string;
  source: string;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: AgentId;
  category: 'budget' | 'deployment' | 'hiring' | 'strategy' | 'marketing';
  status: 'pending' | 'approved' | 'rejected';
  impactLevel: 'medium' | 'high' | 'critical';
  details: {
    financialAmount?: number;
    resourceScope?: string;
    riskAssessment?: string;
  };
  createdAt: string;
  decidedAt?: string;
  reviewerNotes?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'executive_summary' | 'tech_spec' | 'financial_forecast' | 'sop_handbook' | 'marketing_playbook';
  authorAgentId: AgentId;
  projectId?: string;
  content: string;
  wordCount: number;
  lastUpdated: string;
  version: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  agentId: AgentId;
  action: string;
  detail: string;
  type: 'task' | 'meeting' | 'approval' | 'system' | 'code' | 'milestone';
}

export interface SystemAnalytics {
  activeAgentsCount: number;
  runningTasksCount: number;
  completedTasksCount: number;
  pendingApprovalsCount: number;
  totalTokensUsed: number;
  estimatedCostUsd: number;
  productivityIndex: number; // 0 - 100
  projectsCount: number;
  dailyActivityData: Array<{
    date: string;
    tasks: number;
    tokens: number;
    approvals: number;
  }>;
}

export interface OfficeRoom {
  id: string;
  name: string;
  assignedAgent?: AgentId;
  description: string;
  coordinates: [number, number, number]; // 3D position
  floorSize: [number, number];
  themeColor: string;
}

export interface OfficeSettings {
  language: 'id' | 'en';
  theme3D: 'cyber_dark' | 'neon_dawn' | 'corporate_slate';
  graphicsQuality: 'high' | 'medium' | 'low';
  cameraView: 'orbit' | 'first_person' | 'isometric';
  soundEnabled: boolean;
  autoExecuteAgents: boolean;
}
