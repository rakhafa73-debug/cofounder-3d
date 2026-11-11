import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for Gemini generation with graceful fallback
async function generateAIResponse(
  systemInstruction: string,
  userPrompt: string,
  modelName: string = 'gemini-3.8-flash'
): Promise<{ text: string; tokensUsed: number }> {
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
        },
      });
      const text = response.text || '';
      return {
        text,
        tokensUsed: Math.max(120, Math.round(text.length / 4) + 60),
      };
    } catch (err: any) {
      console.warn('Gemini API call failed, generating contextual fallback:', err?.message || err);
    }
  }

  // Fallback intelligent generator if API key is unconfigured or rate limited
  return {
    text: generateContextualFallback(systemInstruction, userPrompt),
    tokensUsed: 140,
  };
}

function generateContextualFallback(systemInstruction: string, prompt: string): string {
  if (systemInstruction.includes('CEO') || systemInstruction.includes('Sophia')) {
    return `### Strategic Executive Assessment
As CEO, I have analyzed your directive: **"${prompt.slice(0, 80)}"**

**1. Strategic Alignment**:
This initiative advances our core mission of creating an autonomous, high-velocity digital enterprise. 

**2. Key Executive Directives**:
- **CTO (David Chen)**: Architect scalable data pipelines and enforce zero-trust security.
- **COO (Elena Rostova)**: Streamline 90-day execution milestones into clear SOPs.
- **CFO (Marcus Sterling)**: Audit unit economics, target 80%+ gross margin, and protect runway.
- **CMO (Aria Thorne)**: Craft high-conversion launch hooks and Product Hunt positioning.

**3. Next Milestone**:
I have initiated project tracking and delegated sprint deliverables to our C-suite. Let's review the boardroom summary in our next standup.`;
  }

  if (systemInstruction.includes('CTO') || systemInstruction.includes('David')) {
    return `### Technical Architecture Blueprint
**Focus**: Robustness, Scalability & PostgreSQL Optimization

\`\`\`typescript
// Architectural Contract
export interface SystemModule {
  readonly serviceId: string;
  readonly status: 'healthy' | 'degraded';
  process(payload: unknown): Promise<{ success: boolean; latencyMs: number }>;
}
\`\`\`

**Core Architectural Recommendations**:
1. **Database Schema**: Enforce PostgreSQL Row Level Security (RLS) on all tenant tables.
2. **Worker Queuing**: Decouple long-running agent tool calls through Redis BullMQ with retry limits.
3. **Latency Target**: Maintain sub-50ms API response time and 60 FPS in WebGL viewport.`;
  }

  if (systemInstruction.includes('CFO') || systemInstruction.includes('Marcus')) {
    return `### Financial Runway & Unit Economics Review
**Guiding Principle**: Conservative capital allocation with verifiable ROI.

- **Estimated Budget**: $15,000 - $25,000 phased over 90 days.
- **Gross Margin Target**: 84% at 500 active subscribers ($49/mo tier).
- **Runway Impact**: With current burn rate of $4,500/mo, our runway remains secure for 18+ months.
- **Threshold**: External commitments over $5,000 will be held in the Approval Queue for your signature.`;
  }

  if (systemInstruction.includes('CMO') || systemInstruction.includes('Aria')) {
    return `### Go-To-Market & Growth Playbook
**Core Hook**: *"Your AI Team. Your Virtual Company."*

**Distribution Channels**:
1. **Product Hunt**: Launching Tuesday 12:01 AM PST with founder origin story video.
2. **Twitter/X & LinkedIn**: 14-day build-in-public series highlighting 3D office interactions.
3. **Viral Referral Loop**: "Invite your co-founder" unlocks executive meeting room perks.
**Target Metrics**: 1,000 Day-1 signups, 35% weekly active retention.`;
  }

  return `### Operational Execution Plan
**Executive Alignment**: Elena Rostova (COO)
- **Phase 1 (Days 1-30)**: Core architecture stabilization and milestone definition.
- **Phase 2 (Days 31-60)**: Closed private beta testing with 50 founders.
- **Phase 3 (Days 61-90)**: Public launch, live boardroom meetings, and scale-up.`;
}

// In-memory runtime state for fast client synchronization
let state = {
  agents: {} as any,
  projects: [] as any[],
  tasks: [] as any[],
  meetings: [] as any[],
  memories: [] as any[],
  approvals: [] as any[],
  documents: [] as any[],
  activities: [] as any[],
  analytics: {
    totalTokens: 972100,
    estimatedCost: 1.45,
    tasksCompleted: 42,
    activeAgents: 5,
  },
};

// API Endpoints

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'COFOUNDER 3D',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. Chat with an AI executive
app.post('/api/agents/chat', async (req: Request, res: Response) => {
  try {
    const { agentId, message, conversationHistory = [] } = req.body;
    const agentRoles: Record<string, { name: string; role: string; prompt: string }> = {
      ceo: {
        name: 'Sophia Vance',
        role: 'Chief Executive Officer',
        prompt: 'You are Sophia Vance, CEO of COFOUNDER 3D. You are visionary, decisive, strategic, and supportive.',
      },
      cto: {
        name: 'David Chen',
        role: 'Chief Technology Officer',
        prompt: 'You are David Chen, CTO of COFOUNDER 3D. You specialize in software architecture, PostgreSQL, security, and TypeScript.',
      },
      coo: {
        name: 'Elena Rostova',
        role: 'Chief Operating Officer',
        prompt: 'You are Elena Rostova, COO of COFOUNDER 3D. You specialize in SOPs, agile task delivery, and operational friction removal.',
      },
      cfo: {
        name: 'Marcus Sterling',
        role: 'Chief Financial Officer',
        prompt: 'You are Marcus Sterling, CFO of COFOUNDER 3D. You are fiscally disciplined, data-driven, and model runway and unit economics.',
      },
      cmo: {
        name: 'Aria Thorne',
        role: 'Chief Marketing Officer',
        prompt: 'You are Aria Thorne, CMO of COFOUNDER 3D. You are a growth marketer, creative copywriter, and viral launch strategist.',
      },
    };

    const target = agentRoles[agentId] || agentRoles.ceo;
    const historyText = conversationHistory
      .slice(-6)
      .map((m: any) => `${m.senderId}: ${m.content}`)
      .join('\n');

    const prompt = `Context:\n${historyText}\n\nFounder: ${message}\n\nRespond as ${target.name} (${target.role}):`;
    const aiResult = await generateAIResponse(target.prompt, prompt);

    state.analytics.totalTokens += aiResult.tokensUsed;
    state.analytics.estimatedCost = Number((state.analytics.totalTokens * 0.0000015).toFixed(4));

    // Log activity
    state.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentId,
      action: 'Executive Consultation',
      detail: `Answered founder query regarding "${message.slice(0, 40)}..."`,
      type: 'system',
    });

    res.json({
      success: true,
      agentId,
      content: aiResult.text,
      tokensUsed: aiResult.tokensUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Chat generation failed' });
  }
});

// 3. Autonomous Multi-Agent Workflow Execution
app.post('/api/workflow/execute', async (req: Request, res: Response) => {
  try {
    const { founderInstruction } = req.body;
    if (!founderInstruction) {
      res.status(400).json({ error: 'founderInstruction is required' });
      return;
    }

    const ceoPrompt = `You are Sophia Vance, CEO of COFOUNDER 3D.
The founder gave this high-level directive: "${founderInstruction}"

Break this down into an autonomous company project with 4 specialized tasks for your executive team:
1. CTO task (engineering/architecture/code)
2. CMO task (marketing/GTM/copy)
3. CFO task (budget/pricing/runway)
4. COO task (SOP/operations/timelines)

Provide your response in JSON format with:
{
  "projectTitle": "short project title",
  "projectDescription": "overview",
  "tasks": [
    {
      "assigneeId": "cto" | "cmo" | "cfo" | "coo",
      "title": "task title",
      "description": "task details",
      "deliverableType": "tech_spec" | "campaign" | "financial_model" | "sop"
    }
  ],
  "ceoSummary": "strategic executive synthesis"
}`;

    const { text, tokensUsed } = await generateAIResponse(
      'You are Sophia Vance, CEO of COFOUNDER 3D. Always respond in valid JSON when requested.',
      ceoPrompt
    );

    state.analytics.totalTokens += tokensUsed;

    let parsedResult: any;
    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch {
      // Robust fallback JSON
      parsedResult = {
        projectTitle: `Execution: ${founderInstruction.slice(0, 45)}`,
        projectDescription: `Autonomous executive initiative to execute founder vision: ${founderInstruction}`,
        tasks: [
          {
            assigneeId: 'cto',
            title: 'System Architecture & Data Security Contract',
            description: 'Design technical blueprint, database schema, and security boundaries.',
            deliverableType: 'tech_spec',
          },
          {
            assigneeId: 'cmo',
            title: 'High-Impact GTM Launch & Distribution Playbook',
            description: 'Develop multi-channel marketing campaign, copy, and product positioning.',
            deliverableType: 'campaign',
          },
          {
            assigneeId: 'cfo',
            title: 'Unit Economics & Financial Projections',
            description: 'Model 12-month runway, server cost budget, and pricing strategy.',
            deliverableType: 'financial_model',
          },
          {
            assigneeId: 'coo',
            title: 'Standard Operating Procedures & Agile Sprint SLA',
            description: 'Formalize execution SOPs and milestone completion criteria.',
            deliverableType: 'sop',
          },
        ],
        ceoSummary: `Executive team mobilized. CTO David Chen, CMO Aria Thorne, CFO Marcus Sterling, and COO Elena Rostova have been assigned their respective deliverables.`,
      };
    }

    const projectId = `proj-${Date.now()}`;
    const newProject = {
      id: projectId,
      title: parsedResult.projectTitle,
      description: parsedResult.projectDescription,
      status: 'in_progress',
      progress: 25,
      leadAgentId: 'ceo',
      budgetAllocated: 15000,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      taskIds: [] as string[],
      deliverablesCount: parsedResult.tasks.length,
    };

    const createdTasks = parsedResult.tasks.map((t: any, index: number) => {
      const taskId = `task-${Date.now()}-${index}`;
      newProject.taskIds.push(taskId);
      return {
        id: taskId,
        projectId,
        title: t.title,
        description: t.description,
        assigneeId: t.assigneeId,
        priority: 'high',
        status: 'working',
        progress: 35,
        dueDate: new Date(Date.now() + (14 + index * 7) * 86400000).toISOString().split('T')[0],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deliverableType: t.deliverableType,
        logs: [
          {
            timestamp: new Date().toISOString(),
            agentId: 'ceo',
            message: `Delegated task from master workflow: "${t.title}"`,
            type: 'tool_call',
          },
        ],
      };
    });

    state.projects.unshift(newProject);
    state.tasks.unshift(...createdTasks);

    state.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentId: 'ceo',
      action: 'Project Orchestration',
      detail: `Decomposed "${founderInstruction.slice(0, 40)}" into ${createdTasks.length} executive tasks`,
      type: 'milestone',
    });

    res.json({
      success: true,
      project: newProject,
      tasks: createdTasks,
      ceoSummary: parsedResult.ceoSummary,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Workflow orchestration failed' });
  }
});

// 4. Boardroom Meeting Simulation
app.post('/api/meetings/simulate', async (req: Request, res: Response) => {
  try {
    const { agenda, participants = ['ceo', 'cto', 'coo', 'cfo', 'cmo'] } = req.body;
    const meetingPrompt = `Conduct an executive C-suite boardroom meeting on this agenda: "${agenda}"
Participants: Sophia Vance (CEO, Moderator), David Chen (CTO), Elena Rostova (COO), Marcus Sterling (CFO), Aria Thorne (CMO).

Generate a structured boardroom transcript with:
1. CEO opening remarks
2. CTO technical analysis
3. CFO financial runway assessment
4. CMO marketing angle
5. COO operational next steps
6. Key Decisions list
7. Action Items list

Return JSON format:
{
  "transcripts": [
    { "agentId": "ceo", "speakerName": "Sophia Vance (CEO)", "speech": "..." },
    { "agentId": "cto", "speakerName": "David Chen (CTO)", "speech": "..." },
    { "agentId": "cfo", "speakerName": "Marcus Sterling (CFO)", "speech": "..." },
    { "agentId": "cmo", "speakerName": "Aria Thorne (CMO)", "speech": "..." },
    { "agentId": "coo", "speakerName": "Elena Rostova (COO)", "speech": "..." }
  ],
  "summary": "concise executive summary",
  "keyDecisions": ["decision 1", "decision 2"],
  "actionItems": [
    { "description": "action 1", "assignee": "cto" },
    { "description": "action 2", "assignee": "cmo" }
  ]
}`;

    const { text, tokensUsed } = await generateAIResponse(
      'You are a corporate boardroom meeting simulator. Always return valid JSON.',
      meetingPrompt
    );

    state.analytics.totalTokens += tokensUsed;

    let parsed: any;
    try {
      const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        transcripts: [
          {
            agentId: 'ceo',
            speakerName: 'Sophia Vance (CEO)',
            speech: `Welcome everyone. We are convened to address: "${agenda}". Let us maintain crisp alignment and determine high-leverage outcomes.`,
          },
          {
            agentId: 'cto',
            speakerName: 'David Chen (CTO)',
            speech: 'From a systems perspective, our architecture can support these demands with zero regression on latency.',
          },
          {
            agentId: 'cfo',
            speakerName: 'Marcus Sterling (CFO)',
            speech: 'The financial allocation fits comfortably within our quarterly runway model with positive unit economics.',
          },
          {
            agentId: 'cmo',
            speakerName: 'Aria Thorne (CMO)',
            speech: 'Our brand positioning is strong. We can convert this momentum into high-intent inbound prospects.',
          },
          {
            agentId: 'coo',
            speakerName: 'Elena Rostova (COO)',
            speech: 'SOPs and review checkpoints have been established. Sprint delivery begins immediately.',
          },
        ],
        summary: `Executive board resolved agenda "${agenda}" with cross-functional consensus.`,
        keyDecisions: ['Unanimous approval to proceed with execution', 'Established weekly progress audits'],
        actionItems: [
          { description: 'Draft technical specifications', assignee: 'cto' },
          { description: 'Launch community teaser campaign', assignee: 'cmo' },
        ],
      };
    }

    const meetingId = `meet-${Date.now()}`;
    const meetingRecord = {
      id: meetingId,
      title: `Boardroom: ${agenda.slice(0, 40)}`,
      agenda,
      status: 'completed',
      date: new Date().toLocaleString(),
      durationMinutes: 35,
      participants,
      transcripts: parsed.transcripts.map((t: any, i: number) => ({
        id: `t-${Date.now()}-${i}`,
        ...t,
        timestamp: `${10 + i}:0${2 * i + 1} AM`,
      })),
      summary: parsed.summary,
      keyDecisions: parsed.keyDecisions,
      actionItems: parsed.actionItems.map((a: any, i: number) => ({
        id: `act-${Date.now()}-${i}`,
        ...a,
      })),
    };

    state.meetings.unshift(meetingRecord);

    state.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentId: 'ceo',
      action: 'Boardroom Adjourned',
      detail: `Completed executive discussion on "${agenda.slice(0, 35)}..."`,
      type: 'meeting',
    });

    res.json({
      success: true,
      meeting: meetingRecord,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Meeting simulation failed' });
  }
});

// 5. REST Agent Management
app.get('/api/agents', (_req: Request, res: Response) => {
  res.json({ success: true, agents: state.agents });
});

app.patch('/api/agents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  if (state.agents[id]) {
    state.agents[id] = { ...state.agents[id], ...updates };
  }
  res.json({ success: true, agent: state.agents[id] });
});

// 6. REST Tasks
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json({ success: true, tasks: state.tasks });
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const newTask = {
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    progress: 0,
    ...req.body,
  };
  state.tasks.unshift(newTask);
  res.json({ success: true, task: newTask });
});

app.patch('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = state.tasks.findIndex((t: any) => t.id === id);
  if (idx !== -1) {
    state.tasks[idx] = { ...state.tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    res.json({ success: true, task: state.tasks[idx] });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// 7. REST Projects
app.get('/api/projects', (_req: Request, res: Response) => {
  res.json({ success: true, projects: state.projects });
});

// 8. REST Approvals
app.get('/api/approvals', (_req: Request, res: Response) => {
  res.json({ success: true, approvals: state.approvals });
});

app.patch('/api/approvals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewerNotes } = req.body;
  const idx = state.approvals.findIndex((a: any) => a.id === id);
  if (idx !== -1) {
    state.approvals[idx].status = status;
    state.approvals[idx].reviewerNotes = reviewerNotes;
    state.approvals[idx].decidedAt = new Date().toISOString();
    res.json({ success: true, approval: state.approvals[idx] });
  } else {
    res.status(404).json({ error: 'Approval request not found' });
  }
});

// 9. REST Memories
app.get('/api/memories', (_req: Request, res: Response) => {
  res.json({ success: true, memories: state.memories });
});

app.post('/api/memories', (req: Request, res: Response) => {
  const newMem = {
    id: `mem-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body,
  };
  state.memories.unshift(newMem);
  res.json({ success: true, memory: newMem });
});

app.delete('/api/memories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  state.memories = state.memories.filter((m: any) => m.id !== id);
  res.json({ success: true });
});

// 10. REST Analytics
app.get('/api/analytics', (_req: Request, res: Response) => {
  res.json({ success: true, analytics: state.analytics });
});

// Vite middleware for dev or static files for prod
async function setupViteServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`COFOUNDER 3D Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteServer();
