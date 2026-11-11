# Technical Architecture — COFOUNDER 3D

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                      │
│                                                                 │
│  ┌─────────────────────────┐       ┌─────────────────────────┐  │
│  │   Three.js 3D Office    │       │   React 19 Dashboard    │  │
│  │  - Procedural PBR rooms │       │  - C-Suite Chat & Voice │  │
│  │  - Animated Characters  │ <───> │  - Boardroom Meeting    │  │
│  │  - Dynamic lighting     │       │  - Project/Task Kanban  │  │
│  │  - Collapsible HUD      │       │  - Memory & Approvals   │  │
│  └─────────────────────────┘       └─────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON / Streaming
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND SERVICES (Express + Node.js)               │
│                                                                 │
│  ┌───────────────────────┐       ┌───────────────────────────┐  │
│  │   API Gateway & Auth  │       │   Agent Orchestrator      │  │
│  │  - Rate Limiter       │       │  - CEO Decomposer         │  │
│  │  - Request Validation │ <───> │  - Execution Pipeline     │  │
│  │  - Security Sanitizer │       │  - Human Approval Gates   │  │
│  └───────────────────────┘       └─────────────┬─────────────┘  │
│                                                │                │
│  ┌────────────────────────┐                    ▼                │
│  │  AI Provider Adapter   │       ┌──────────────────────────┐  │
│  │  - GoogleGenAI SDK     │ <───> │  Gemini 3.8 Flash Engine │  │
│  │  - Model Fallbacks     │       │  - Low latency reasoning │  │
│  │  - Token Cost Tracker  │       │  - Structured JSON Specs │  │
│  └────────────────────────┘       └──────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE & INFRASTRUCTURE                  │
│                                                                 │
│  ┌─────────────────────────┐       ┌─────────────────────────┐  │
│  │  PostgreSQL / Supabase  │       │  Redis & Worker Queue   │  │
│  │  - 22 Relational Tables │       │  - BullMQ Background    │  │
│  │  - Row Level Security   │       │  - Sandboxed Runner     │  │
│  │  - pgvector Embeddings  │       │  - Async Retries        │  │
│  └─────────────────────────┘       └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Security & Privacy Boundary
1. **Server-Side AI SDK**: All `@google/genai` calls execute exclusively on the server (`server.ts`). Zero client API exposure.
2. **Deterministic Role Boundaries**: C-suite agents operate within assigned tools and cannot execute unauthorized transactions or destructive operations.
3. **Database RLS**: Multi-tenant isolation enforced at the PostgreSQL database level.
