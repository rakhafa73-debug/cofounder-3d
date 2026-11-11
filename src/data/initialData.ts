import { AIAgent, Project, Task, Meeting, MemoryItem, ApprovalRequest, DocumentItem, OfficeRoom, OfficeSettings } from '../types';

export const INITIAL_AGENTS: Record<string, AIAgent> = {
  ceo: {
    id: 'ceo',
    name: 'Sophia Vance',
    role: 'Chief Executive Officer',
    title: 'AI CEO & Strategic Director',
    department: 'Executive Suite',
    avatarColor: '#3B82F6', // Electric Blue
    secondaryColor: '#60A5FA',
    personality: 'Visionary, decisive, analytical, and supportive leader. Focuses on overarching business model, market product-fit, cross-agent coordination, and high-level milestones.',
    specialization: ['Corporate Strategy', 'Milestone Planning', 'Cross-Agent Coordination', 'Founder Alignment', 'Investor Decks'],
    responsibilities: [
      'Deconstruct founder visions into actionable business initiatives',
      'Orchestrate CTO, COO, CFO, and CMO task delegations',
      'Synthesize executive reports and strategic reviews',
      'Evaluate execution quality and enforce corporate standards'
    ],
    systemPrompt: `You are Sophia Vance, the AI Chief Executive Officer (CEO) of COFOUNDER 3D.
Your purpose is to serve as the founder's premier executive co-founder. You think strategically, communicate with crisp clarity and authority, prioritize growth and sustainability, and guide the rest of the executive team (CTO, COO, CFO, CMO).
When given a business goal or idea, break it down systematically into strategy, market positioning, actionable roadmaps, and specific delegations for your C-suite peers.
Always maintain a visionary, encouraging, yet relentlessly realistic demeanor. Support both Indonesian and English fluently.`,
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.7,
    tools: ['create_project', 'delegate_task', 'synthesize_report', 'request_approval', 'schedule_meeting'],
    permissions: ['all_projects_read_write', 'delegation_authority', 'c_suite_meeting_host', 'financial_oversight'],
    status: 'idle',
    currentActivity: 'Monitoring company OKRs and market benchmarks',
    roomLocation: 'CEO Office',
    metrics: {
      tasksCompleted: 42,
      tokensUsed: 184500,
      efficiencyScore: 98,
      uptimePercent: 99.9,
      lastActive: 'Just now'
    }
  },
  cto: {
    id: 'cto',
    name: 'David Chen',
    role: 'Chief Technology Officer',
    title: 'AI CTO & Systems Architect',
    department: 'Engineering & R&D',
    avatarColor: '#06B6D4', // Cyan
    secondaryColor: '#22D3EE',
    personality: 'Pragmatic, deep technical thinker, security-first, architecture perfectionist. Emphasizes scalability, clean code, PostgreSQL optimization, and cloud cost efficiency.',
    specialization: ['Cloud Architecture', 'TypeScript / Node.js / React', 'PostgreSQL & DB Schema', 'API Design', 'AI Engineering'],
    responsibilities: [
      'Design robust technical architectures and database schemas',
      'Review technical proposals and enforce security standards',
      'Generate code blueprints, API contracts, and implementation guides',
      'Manage CI/CD, sandboxing, and infrastructural resilience'
    ],
    systemPrompt: `You are David Chen, the AI Chief Technology Officer (CTO) of COFOUNDER 3D.
You are a senior principal engineer and software architect. You solve complex technical challenges with clean modular designs, resilient database structures (PostgreSQL, Supabase), type safety (TypeScript), and high-performance server architectures.
Provide detailed architectural diagrams, schema models, and production-ready code with comprehensive reasoning. Support both Indonesian and English.`,
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.3,
    tools: ['generate_architecture', 'write_code_spec', 'sql_schema_generator', 'code_review', 'sandbox_execute'],
    permissions: ['codebase_read_write', 'database_schema_admin', 'infrastructure_config'],
    status: 'idle',
    currentActivity: 'Benchmarking PostgreSQL query plans and API latency',
    roomLocation: 'CTO Lab',
    metrics: {
      tasksCompleted: 67,
      tokensUsed: 295400,
      efficiencyScore: 96,
      uptimePercent: 99.8,
      lastActive: '2m ago'
    }
  },
  coo: {
    id: 'coo',
    name: 'Elena Rostova',
    role: 'Chief Operating Officer',
    title: 'AI COO & Head of Operations',
    department: 'Operations & Process',
    avatarColor: '#10B981', // Emerald Green
    secondaryColor: '#34D399',
    personality: 'Meticulous, process-oriented, efficiency hacker, transparent. Loves clear SOPs, agile task pipelines, team bandwidth optimization, and risk mitigation.',
    specialization: ['SOP Documentation', 'Agile Operations', 'Workflow Automation', 'Quality Assurance', 'Resource Allocation'],
    responsibilities: [
      'Establish company Standard Operating Procedures (SOPs)',
      'Manage sprint workflows and clear task bottlenecks',
      'Audit organizational efficiency and execution timelines',
      'Formulate disaster recovery and business continuity plans'
    ],
    systemPrompt: `You are Elena Rostova, the AI Chief Operating Officer (COO) of COFOUNDER 3D.
You are relentless about operational excellence, smooth workflows, well-documented SOPs, and eliminating friction in delivery. You ensure every team member knows their exact deadlines, inputs, and outputs.
Produce crisp step-by-step operating procedures, milestone trackers, and agile task breakdowns. Support both Indonesian and English.`,
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.5,
    tools: ['create_sop', 'optimize_workflow', 'manage_pipeline', 'log_incident', 'track_milestone'],
    permissions: ['workflow_admin', 'sprint_management', 'qa_approval'],
    status: 'idle',
    currentActivity: 'Optimizing 90-day execution sprints and operational SLAs',
    roomLocation: 'COO Office',
    metrics: {
      tasksCompleted: 51,
      tokensUsed: 142300,
      efficiencyScore: 97,
      uptimePercent: 100.0,
      lastActive: '5m ago'
    }
  },
  cfo: {
    id: 'cfo',
    name: 'Marcus Sterling',
    role: 'Chief Financial Officer',
    title: 'AI CFO & Capital Strategist',
    department: 'Finance & Compliance',
    avatarColor: '#F59E0B', // Amber / Gold
    secondaryColor: '#FBBF24',
    personality: 'Fiscally conservative, analytical, data-driven, protective of cash runway. Demands verifiable unit economics and realistic CAC/LTV models.',
    specialization: ['Financial Modeling', 'Runway Forecasting', 'Unit Economics', 'Pricing Strategy', 'Burn Rate Optimization'],
    responsibilities: [
      'Build comprehensive 12-to-36-month financial forecasts',
      'Audit cloud spending, AI token costs, and vendor licensing',
      'Formulate subscription pricing and tiered monetization models',
      'Gatekeep budget approvals exceeding operational thresholds'
    ],
    systemPrompt: `You are Marcus Sterling, the AI Chief Financial Officer (CFO) of COFOUNDER 3D.
You are a disciplined, mathematically precise financial leader. You analyze runway, MRR/ARR projections, gross margins, CAC, LTV, and operating leverage.
Never hallucinate bank balances or fabricated verified real-world account balances; always base models on explicit assumptions, unit economics, and target scenarios. Support both Indonesian and English.`,
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.2,
    tools: ['create_financial_model', 'forecast_runway', 'cost_benefit_analysis', 'audit_expenses'],
    permissions: ['budget_allocation_review', 'financial_reporting', 'pricing_admin'],
    status: 'idle',
    currentActivity: 'Auditing 18-month burn rate scenarios and gross margins',
    roomLocation: 'CFO Office',
    metrics: {
      tasksCompleted: 38,
      tokensUsed: 128900,
      efficiencyScore: 99,
      uptimePercent: 99.9,
      lastActive: '12m ago'
    }
  },
  cmo: {
    id: 'cmo',
    name: 'Aria Thorne',
    role: 'Chief Marketing Officer',
    title: 'AI CMO & Growth Architect',
    department: 'Growth & Brand',
    avatarColor: '#8B5CF6', // Violet
    secondaryColor: '#A78BFA',
    personality: 'Creative, persuasive, storytelling genius, growth-obsessed. Master of organic distribution, brand identity, viral product loops, and compelling copy.',
    specialization: ['Go-to-Market (GTM)', 'Viral Content & Copy', 'Brand Identity', 'Product Hunt Launches', 'Conversion Funnel'],
    responsibilities: [
      'Develop multi-channel GTM campaigns and launch strategies',
      'Write persuasive landing page copy and social media playbooks',
      'Design product narrative, positioning matrices, and pitch angles',
      'Analyze growth funnels and viral referral loops'
    ],
    systemPrompt: `You are Aria Thorne, the AI Chief Marketing Officer (CMO) of COFOUNDER 3D.
You are an elite growth marketer and creative brand strategist. You combine emotional storytelling with ruthless funnel metrics. You craft magnetic hooks, clear value propositions, launch playbooks, and viral distribution loops that convert prospects into passionate advocates.
Support both Indonesian and English seamlessly.`,
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.8,
    tools: ['generate_campaign', 'write_copy', 'analyze_funnel', 'market_research', 'launch_playbook'],
    permissions: ['brand_assets_admin', 'marketing_campaign_deploy', 'social_playbook_publish'],
    status: 'idle',
    currentActivity: 'Drafting multi-tier Product Hunt & LinkedIn launch campaign',
    roomLocation: 'Marketing Studio',
    metrics: {
      tasksCompleted: 58,
      tokensUsed: 221000,
      efficiencyScore: 95,
      uptimePercent: 99.7,
      lastActive: '1m ago'
    }
  }
};

export const INITIAL_ROOMS: OfficeRoom[] = [
  {
    id: 'lobby',
    name: 'Main Lobby & Reception',
    description: 'Central executive hub with digital visitor kiosk, lounge sofas, and company mission hologram.',
    coordinates: [0, 0, 0],
    floorSize: [12, 10],
    themeColor: '#3B82F6'
  },
  {
    id: 'ceo_office',
    name: 'CEO Executive Office',
    assignedAgent: 'ceo',
    description: 'Corner office with panoramic skyline view, mahogany desk, and strategic OKR warboard.',
    coordinates: [-14, 0, -8],
    floorSize: [10, 8],
    themeColor: '#3B82F6'
  },
  {
    id: 'cto_lab',
    name: 'CTO Engineering Lab',
    assignedAgent: 'cto',
    description: 'Dual ultrawide workstation, server cluster racks, and live architecture whiteboard.',
    coordinates: [14, 0, -8],
    floorSize: [10, 8],
    themeColor: '#06B6D4'
  },
  {
    id: 'coo_office',
    name: 'COO Operations Suite',
    assignedAgent: 'coo',
    description: 'Kanban flow monitors, process maps, and real-time execution dashboards.',
    coordinates: [-14, 0, 8],
    floorSize: [10, 8],
    themeColor: '#10B981'
  },
  {
    id: 'cfo_office',
    name: 'CFO Financial Desk',
    assignedAgent: 'cfo',
    description: 'Financial ledger monitors, runway charts, and secure accounting workstation.',
    coordinates: [14, 0, 8],
    floorSize: [10, 8],
    themeColor: '#F59E0B'
  },
  {
    id: 'cmo_studio',
    name: 'CMO Marketing Studio',
    assignedAgent: 'cmo',
    description: 'Moodboards, brand design displays, launch calendars, and creative lounge.',
    coordinates: [0, 0, 14],
    floorSize: [12, 7],
    themeColor: '#8B5CF6'
  },
  {
    id: 'meeting_room',
    name: 'AI Boardroom & Meeting Hub',
    description: 'Circular conference table with interactive 3D holographic projection and AI seats.',
    coordinates: [0, 0, -14],
    floorSize: [14, 10],
    themeColor: '#6366F1'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: '90-Day SaaS Global Launch Strategy',
    description: 'Comprehensive business, architecture, financial, and growth blueprint to take COFOUNDER 3D from closed alpha to 10,000 active founders.',
    status: 'in_progress',
    progress: 74,
    leadAgentId: 'ceo',
    budgetAllocated: 45000,
    startDate: '2026-03-01',
    targetDate: '2026-05-31',
    taskIds: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'],
    deliverablesCount: 5
  },
  {
    id: 'proj-2',
    title: 'Autonomous Multi-Agent Memory & Sandboxing',
    description: 'Implementing pgvector long-term episodic memory indexing and secure isolated worker execution for agent tool calls.',
    status: 'in_progress',
    progress: 88,
    leadAgentId: 'cto',
    budgetAllocated: 28000,
    startDate: '2026-03-10',
    targetDate: '2026-04-15',
    taskIds: ['task-6', 'task-7'],
    deliverablesCount: 3
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Formulate 90-Day Master Milestone Roadmap',
    description: 'Establish sprint milestones, OKRs, and weekly execution checkpoints for all departments.',
    assigneeId: 'ceo',
    priority: 'urgent',
    status: 'completed',
    progress: 100,
    dueDate: '2026-03-15',
    dependencies: [],
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-03T14:30:00Z',
    deliverableType: 'document',
    result: 'Complete 90-Day SaaS Milestone Roadmap established with 4 core phases: Alpha Stabilization, Private Beta GTM, Product Hunt Blast, and Scale-Up.',
    logs: [
      { timestamp: '2026-03-01T09:00:00Z', agentId: 'ceo', message: 'Initiated roadmap synthesis from founder vision.', type: 'info' },
      { timestamp: '2026-03-02T11:20:00Z', agentId: 'ceo', message: 'Delegated technical track to CTO David Chen and financial model to CFO Marcus Sterling.', type: 'tool_call' },
      { timestamp: '2026-03-03T14:30:00Z', agentId: 'ceo', message: 'Roadmap finalized and committed to company deliverables.', type: 'result' }
    ]
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Cloud Architecture & Multi-Tenant PostgreSQL Spec',
    description: 'Design zero-trust RLS policies, connection pooling via Supabase, and isolated AI worker runners.',
    assigneeId: 'cto',
    priority: 'high',
    status: 'completed',
    progress: 100,
    dueDate: '2026-03-20',
    dependencies: ['task-1'],
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-05T16:00:00Z',
    deliverableType: 'tech_spec',
    result: 'PostgreSQL architecture specification with 22 relational tables, RLS security matrix, and Redis BullMQ worker queue pipeline approved.',
    logs: [
      { timestamp: '2026-03-02T10:00:00Z', agentId: 'cto', message: 'Analyzing data modeling requirements for 10k concurrent organizations.', type: 'thought' },
      { timestamp: '2026-03-04T12:00:00Z', agentId: 'cto', message: 'Generated SQL migration schema with full RLS constraints.', type: 'code' }
    ]
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: '18-Month Runway Model & Token Cost Forecast',
    description: 'Calculate unit economics per active company, infrastructure overhead, and subscription pricing tiers.',
    assigneeId: 'cfo',
    priority: 'high',
    status: 'completed',
    progress: 100,
    dueDate: '2026-03-22',
    dependencies: ['task-1', 'task-2'],
    createdAt: '2026-03-03T14:00:00Z',
    updatedAt: '2026-03-06T10:15:00Z',
    deliverableType: 'financial_model',
    result: 'Detailed 18-month financial projection: Pro tier at $49/mo and Enterprise at $299/mo yields 84% gross margin at scale.',
    logs: [
      { timestamp: '2026-03-03T14:00:00Z', agentId: 'cfo', message: 'Collected LLM token inference cost averages ($0.15/1M input, $0.60/1M output).', type: 'info' },
      { timestamp: '2026-03-05T09:30:00Z', agentId: 'cfo', message: 'Formulated multi-scenario financial model (Base, Bull, Conservative).', type: 'result' }
    ]
  },
  {
    id: 'task-4',
    projectId: 'proj-1',
    title: 'GTM Multi-Channel Launch Playbook & Copywriting',
    description: 'Craft viral landing page narrative, Founder social hooks, and Product Hunt launch kit.',
    assigneeId: 'cmo',
    priority: 'high',
    status: 'working',
    progress: 65,
    dueDate: '2026-03-28',
    dependencies: ['task-1'],
    createdAt: '2026-03-04T11:00:00Z',
    updatedAt: '2026-03-07T08:00:00Z',
    deliverableType: 'campaign',
    requiresApproval: true,
    logs: [
      { timestamp: '2026-03-04T11:00:00Z', agentId: 'cmo', message: 'Auditing top 20 AI SaaS launches on Product Hunt in Q1 2026.', type: 'info' },
      { timestamp: '2026-03-06T15:40:00Z', agentId: 'cmo', message: 'Completed hero section copy and 14-day teaser cadence.', type: 'thought' }
    ]
  },
  {
    id: 'task-5',
    projectId: 'proj-1',
    title: 'Standard Operating Procedures (SOP) & Execution SLAs',
    description: 'Establish quality evaluation rubric, bug triage escalation SOP, and automated approval matrix.',
    assigneeId: 'coo',
    priority: 'medium',
    status: 'review',
    progress: 90,
    dueDate: '2026-03-30',
    dependencies: ['task-2'],
    createdAt: '2026-03-05T09:00:00Z',
    updatedAt: '2026-03-07T11:00:00Z',
    deliverableType: 'sop',
    logs: [
      { timestamp: '2026-03-05T09:00:00Z', agentId: 'coo', message: 'Drafting SOP-01: Agent Autonomous Execution & Human Escalation Boundary.', type: 'info' }
    ]
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'All-Hands C-Suite: Q2 Strategic Alignment',
    agenda: 'Align executive team on 90-day launch goals, review CTO technical architecture, validate CFO financial runway, and approve CMO launch campaign.',
    status: 'completed',
    date: '2026-03-06 10:00 AM',
    durationMinutes: 45,
    participants: ['ceo', 'cto', 'coo', 'cfo', 'cmo'],
    transcripts: [
      {
        id: 't-1',
        agentId: 'ceo',
        speakerName: 'Sophia Vance (CEO)',
        speech: 'Team, welcome to our Q2 strategic boardroom session. We have locked in our 90-day trajectory. David, how is our multi-agent architecture progressing?',
        timestamp: '10:02 AM',
        avatarColor: '#3B82F6'
      },
      {
        id: 't-2',
        agentId: 'cto',
        speakerName: 'David Chen (CTO)',
        speech: 'Engineering is solid. The PostgreSQL schema with RLS and the Three.js 3D office viewport are performing at 60 FPS. Next is optimizing memory vector retrieval.',
        timestamp: '10:05 AM',
        avatarColor: '#06B6D4'
      },
      {
        id: 't-3',
        agentId: 'cfo',
        speakerName: 'Marcus Sterling (CFO)',
        speech: 'From a capital perspective, our unit economics are pristine. With a projected gross margin of 84%, our initial $45k allocation gives us 18+ months of comfortable runway.',
        timestamp: '10:08 AM',
        avatarColor: '#F59E0B'
      },
      {
        id: 't-4',
        agentId: 'cmo',
        speakerName: 'Aria Thorne (CMO)',
        speech: 'Our brand message "Your AI Team. Your Virtual Company" resonates exceptionally well. I have prepared our Product Hunt launch kit awaiting final founder signoff.',
        timestamp: '10:12 AM',
        avatarColor: '#8B5CF6'
      },
      {
        id: 't-5',
        agentId: 'coo',
        speakerName: 'Elena Rostova (COO)',
        speech: 'All sprint tickets and human-in-the-loop approval gates are codified. We are ready to execute with zero operational friction.',
        timestamp: '10:15 AM',
        avatarColor: '#10B981'
      }
    ],
    summary: 'Executive leadership met to validate the 90-day company trajectory. Architecture confirmed stable at scale, financial model verified with 18 months runway, and marketing launch materials queued for founder approval.',
    keyDecisions: [
      'Approved initial $45,000 launch budget allocation',
      'Mandated strict human-in-the-loop approvals for external campaigns and expenditures > $10,000',
      'Selected Gemini 3.8 Flash for ultra-fast, high-reasoning agent orchestration'
    ],
    actionItems: [
      { id: 'act-1', description: 'Finalize Product Hunt launch kit copy', assignee: 'cmo', convertedToTaskId: 'task-4' },
      { id: 'act-2', description: 'Benchmark pgvector query latency under load', assignee: 'cto' }
    ]
  }
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    type: 'company' as any,
    title: 'Core Company Mission & North Star',
    content: 'COFOUNDER 3D exists to empower solo founders and digital entrepreneurs with an elite autonomous C-suite team living inside an interactive 3D virtual office.',
    relevanceScore: 5,
    tags: ['mission', 'vision', 'brand'],
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-01T08:00:00Z',
    source: 'Founder Charter'
  },
  {
    id: 'mem-2',
    type: 'decision',
    title: 'AI Model Selection Decision: Gemini 3.8 Flash',
    content: 'Selected Gemini 3.8 Flash for all primary agent cognitive loops due to state-of-the-art reasoning, low latency, structured JSON schemas, and cost efficiency.',
    relevanceScore: 5,
    tags: ['architecture', 'ai', 'model'],
    createdAt: '2026-03-02T14:00:00Z',
    updatedAt: '2026-03-02T14:00:00Z',
    source: 'C-Suite Boardroom'
  },
  {
    id: 'mem-3',
    type: 'project',
    title: '90-Day GTM Milestone Targets',
    content: 'Phase 1: Alpha 50 users. Phase 2: Beta 500 users. Phase 3: Public Launch & 10,000 MAU target with $50k ARR run rate within 90 days.',
    projectId: 'proj-1',
    relevanceScore: 4,
    tags: ['gtm', 'okrs', 'targets'],
    createdAt: '2026-03-03T11:00:00Z',
    updatedAt: '2026-03-03T11:00:00Z',
    source: 'CEO Sophia Vance'
  },
  {
    id: 'mem-4',
    type: 'agent',
    title: 'CFO Risk Boundary & Financial Guardrails',
    content: 'CFO Marcus Sterling will strictly flag and require founder approval for any external spend exceeding $5,000 or contract commitments longer than 3 months.',
    agentId: 'cfo',
    relevanceScore: 4,
    tags: ['governance', 'finance', 'limits'],
    createdAt: '2026-03-04T16:00:00Z',
    updatedAt: '2026-03-04T16:00:00Z',
    source: 'Governance Charter'
  }
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr-1',
    title: 'Authorize $12,500 Cloud & GPU Inference Budget',
    description: 'Quarterly prepayment for high-throughput dedicated cloud instances and Gemini API inference quotas.',
    requestedBy: 'cfo',
    category: 'budget',
    status: 'pending',
    impactLevel: 'high',
    details: {
      financialAmount: 12500,
      resourceScope: 'Production inference & Supabase PostgreSQL enterprise scale',
      riskAssessment: 'Low risk; secures 20% discount on 6-month commitment and locks in API rates.'
    },
    createdAt: '2026-03-07T09:30:00Z'
  },
  {
    id: 'appr-2',
    title: 'Launch Product Hunt & Paid Creator Campaign',
    description: 'Approve public dissemination of launch video teaser and influencer review tier with 5 top tech creators.',
    requestedBy: 'cmo',
    category: 'marketing',
    status: 'pending',
    impactLevel: 'medium',
    details: {
      financialAmount: 3500,
      resourceScope: 'Public social media and YouTube influencer placements',
      riskAssessment: 'High visibility; will direct significant initial traffic spike to virtual office server.'
    },
    createdAt: '2026-03-07T11:15:00Z'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'COFOUNDER 3D — Master Executive Strategic Plan',
    type: 'executive_summary',
    authorAgentId: 'ceo',
    projectId: 'proj-1',
    version: 'v1.2',
    wordCount: 1420,
    lastUpdated: '2026-03-06',
    content: `# COFOUNDER 3D: Master Executive Strategic Plan

## Executive Summary
COFOUNDER 3D addresses the single most acute bottleneck of modern digital entrepreneurship: the lonely founder carrying product, engineering, finance, operations, and marketing on their own.

By creating an autonomous C-suite living inside an interactive 3D virtual office, founders lead an agile executive team that actually plans, codes, models, and markets alongside them.

## Core Pillars
1. **Real Autonomous Execution**: Agents do not merely chat; they produce real deliverables (PostgreSQL schemas, financial models, SOPs, marketing campaigns).
2. **Interactive Spatial Presence**: The 3D virtual office gives visual, spatial grounding to company operations.
3. **Rigorous Governance**: Human-in-the-loop approval thresholds prevent unauthorized spending or erroneous deployments.

## 90-Day Milestones
- **Month 1**: Core architecture stabilization, RLS security verification, and initial executive workflow loops.
- **Month 2**: Multi-agent meeting room debate engine and pgvector memory augmentation.
- **Month 3**: Global launch across Product Hunt, Hacker News, and digital founder communities.`
  },
  {
    id: 'doc-2',
    title: 'Enterprise Technical Architecture & Data Security Spec',
    type: 'tech_spec',
    authorAgentId: 'cto',
    projectId: 'proj-1',
    version: 'v2.0',
    wordCount: 2150,
    lastUpdated: '2026-03-05',
    content: `# Enterprise Technical Architecture Specification

## Architecture Overview
The platform utilizes a modern full-stack decoupled architecture designed for sub-second agent responsiveness and 60 FPS 3D rendering.

\`\`\`
[ Client WebGL / Three.js 3D Virtual Office ]
              │ WebSocket / SSE
              ▼
[ Next.js / Express Gateway & Auth Middleware ]
              │
       ┌──────┴──────────────────────────┐
       ▼                                 ▼
[ Gemini 3.8 Flash SDK Engine ]    [ PostgreSQL + RLS Database ]
       │                                 │
       ▼                                 ▼
[ Multi-Agent Orchestration ]      [ Redis BullMQ Worker Queue ]
\`\`\`

## Security & Isolation
- **Row Level Security (RLS)**: Enforces organization isolation at the database layer.
- **Worker Sandboxing**: Tool executions run with strict timeout limits and non-root execution.
- **Zero Client Secrets**: All Gemini SDK and database secrets remain securely on the server.`
  },
  {
    id: 'doc-3',
    title: '18-Month Financial Projection & Unit Economics',
    type: 'financial_forecast',
    authorAgentId: 'cfo',
    projectId: 'proj-1',
    version: 'v1.0',
    wordCount: 980,
    lastUpdated: '2026-03-06',
    content: `# 18-Month Financial Projections & Unit Economics

## Unit Economics Breakdown (Pro Tier: $49/mo)
- **Average Token Consumption**: ~2.5M tokens/mo = $0.90
- **Database & Compute Storage**: $1.20/tenant
- **Payment Processing (Stripe 2.9% + $0.30)**: $1.72
- **Net COGS per Active Seat**: $3.82
- **Gross Margin**: 92.2%

## Runway & Break-Even Analysis
With our conservative seed capitalization and disciplined burn rate of $4,500/month, the company achieves cash-flow positive status at 140 paying subscribers.`
  }
];

export const INITIAL_SETTINGS: OfficeSettings = {
  language: 'en',
  theme3D: 'cyber_dark',
  graphicsQuality: 'high',
  cameraView: 'orbit',
  soundEnabled: true,
  autoExecuteAgents: true
};
