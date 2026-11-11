# COFOUNDER 3D — AI Virtual Co-Founder & Autonomous Office Platform

> *"Your AI Team. Your Virtual Company."*

COFOUNDER 3D is a spatial, full-stack autonomous virtual office platform where solo founders and modern tech companies lead a dedicated AI C-Suite inside an interactive 3D headquarters.

---

## 🏛️ Autonomous C-Suite Executive Team

1. **Sophia Vance — Chief Executive Officer (CEO)**
   - **Role**: Corporate governance, founder directive breakdown, cross-agent orchestration, milestone evaluation, investor decks.
   - **Station**: CEO Corner Executive Office (Panoramic skyline view, OKR warboard).
   
2. **David Chen — Chief Technology Officer (CTO)**
   - **Role**: Enterprise cloud architecture, multi-tenant PostgreSQL schemas, RLS policies, code reviews, and worker sandboxing.
   - **Station**: CTO Engineering Lab (Dual ultrawide monitors, blinking server cluster racks).

3. **Elena Rostova — Chief Operating Officer (COO)**
   - **Role**: Standard Operating Procedures (SOPs), agile pipeline management, execution SLAs, and cross-functional friction elimination.
   - **Station**: COO Operations Suite (Live Kanban monitors, process diagrams).

4. **Marcus Sterling — Chief Financial Officer (CFO)**
   - **Role**: 18-to-36-month financial projections, unit economics, SaaS tiered pricing, and capital expenditure oversight.
   - **Station**: CFO Desk (Financial ledger screens, runway charts).

5. **Aria Thorne — Chief Marketing Officer (CMO)**
   - **Role**: Go-To-Market (GTM) launches, viral hooks, Product Hunt playbooks, high-converting copywriting, and growth funnels.
   - **Station**: CMO Creative Studio (Neon signage, launch moodboards).

---

## 🚀 Key Features

- **Full Interactive 3D Virtual Office**:
  - Three.js WebGL scene with PBR materials, contact shadows, procedural room construction, and dynamic animated executive avatars.
  - Zero external 404 asset dependencies (all textures, canvas monitors, nameplates, and Web Audio SFX generated procedurally in code).
  - Collapsible bottom control dock with view switching (Overview, CEO Office, CTO Lab, Boardroom, etc.), day/night lighting toggles, and zen mode.
  - Keyboard pan navigation (WASD / Arrow Keys), OrbitControls, and click-to-interact raycasting.

- **Autonomous Workflow Orchestration**:
  - Provide any high-level founder directive (e.g. *"Buatkan strategi bisnis startup SaaS selama 90 hari"*).
  - CEO Sophia Vance breaks down the initiative and delegates technical, marketing, financial, and operational deliverables to the team.
  - Real-time kinematic reflections in 3D: agents transition from idle to typing/working and meeting.

- **AI Boardroom Roundtable**:
  - Convene multi-agent debates with real turn-based AI responses.
  - Automatically captures transcripts, summarizes findings, registers binding decisions, and converts action items into executable sprint tasks with 1 click.

- **Human-in-the-Loop Governance**:
  - Mandatory founder signoff for external financial commitments (> $10k), production deployments, and public marketing launches.
  - Full audit trail with Approve, Decline, and Request Revision workflows.

- **Enterprise PostgreSQL & Supabase Database**:
  - Production-ready SQL migration (`supabase/migrations/001_cofounder_schema.sql`) covering 22 relational tables, Row Level Security (RLS) policies, and pgvector memory indexing.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **3D Engine**: Three.js, OrbitControls, RoomEnvironment PMREM reflections.
- **Backend**: Express (Node.js), TypeScript (`server.ts`).
- **AI Engine**: `@google/genai` (Gemini 3.8 Flash).
- **Database**: PostgreSQL / Supabase with Row Level Security.
- **Containers**: Dockerfile & docker-compose.yml.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run the full-stack development server (Express + Vite)
npm run dev

# Compile TypeScript
npm run lint

# Build for production
npm run build
```

---

## 🔒 Security & Privacy

1. All `@google/genai` SDK operations execute exclusively on the server (`server.ts`).
2. Zero API keys or secrets exposed to client bundles.
3. Emergency Stop button halts all agent worker loops immediately.
