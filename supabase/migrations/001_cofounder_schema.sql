-- ====================================================================
-- COFOUNDER 3D: ENTERPRISE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Platform: Supabase PostgreSQL with UUID, RLS, Indexes & Vector Support
-- Version: 1.0.0
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable vector extension for agent episodic memory search if available
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('founder', 'co_founder', 'admin', 'observer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE agent_status_type AS ENUM ('idle', 'thinking', 'working', 'meeting', 'waiting_approval', 'completed', 'error');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE task_status_type AS ENUM ('backlog', 'pending', 'working', 'review', 'approval_required', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE task_priority_type AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE approval_status_type AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE (Supabase auth.users profile mirror)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT DEFAULT 'AI-Powered Digital Company',
  founder_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  settings JSONB DEFAULT '{"theme": "cyber_dark", "auto_approval_threshold": 5000}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORGANIZATION MEMBERS TABLE (RBAC)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role_type DEFAULT 'founder',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- 6. AGENT ROLES TABLE
CREATE TABLE IF NOT EXISTS agent_roles (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  default_permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AGENT MODELS TABLE (Supported AI model catalog)
CREATE TABLE IF NOT EXISTS agent_models (
  id VARCHAR(100) PRIMARY KEY,
  provider VARCHAR(50) NOT NULL, -- gemini, openai, anthropic
  model_name TEXT NOT NULL,
  context_window INT DEFAULT 1000000,
  cost_per_1m_input NUMERIC(10, 4) DEFAULT 0.15,
  cost_per_1m_output NUMERIC(10, 4) DEFAULT 0.60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AI AGENTS TABLE
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id VARCHAR(50) NOT NULL REFERENCES agent_roles(id),
  slug VARCHAR(20) NOT NULL, -- ceo, cto, coo, cfo, cmo
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  personality TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  model_id VARCHAR(100) NOT NULL REFERENCES agent_models(id),
  temperature NUMERIC(3, 2) DEFAULT 0.7,
  avatar_color VARCHAR(20) DEFAULT '#3B82F6',
  room_location VARCHAR(50) DEFAULT 'Main Lobby',
  status agent_status_type DEFAULT 'idle',
  current_activity TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- 9. AGENT MEMORIES TABLE
CREATE TABLE IF NOT EXISTS agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  memory_type VARCHAR(30) NOT NULL, -- short_term, long_term, project, decision, agent
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  relevance_score INT DEFAULT 5,
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  embedding vector(768), -- compatible with gemini-embedding-2 / pgvector
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'in_progress',
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget_allocated NUMERIC(12, 2) DEFAULT 0.00,
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority task_priority_type DEFAULT 'medium',
  status task_status_type DEFAULT 'pending',
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE,
  deliverable_type VARCHAR(50),
  requires_approval BOOLEAN DEFAULT FALSE,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TASK DEPENDENCIES
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- 13. AGENT EXECUTIONS TABLE (Audit log of agent cognitive runs)
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  prompt_input TEXT NOT NULL,
  output_response TEXT,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AGENT TOOL CALLS
CREATE TABLE IF NOT EXISTS agent_tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES agent_executions(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  arguments JSONB NOT NULL,
  result JSONB,
  status VARCHAR(20) DEFAULT 'success',
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Executive Chat',
  is_group_chat BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL, -- founder, agent, system
  agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  thought_process TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. MEETINGS & NOTES
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  agenda TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INT DEFAULT 30,
  summary TEXT,
  key_decisions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_name TEXT NOT NULL,
  speech TEXT NOT NULL,
  spoken_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. DOCUMENTS TABLE (Deliverables repository)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  author_agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  doc_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR(20) DEFAULT 'v1.0',
  word_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. APPROVALS TABLE (Human-in-the-loop)
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- budget, deployment, marketing, hiring
  impact_level VARCHAR(20) DEFAULT 'medium',
  details JSONB DEFAULT '{}'::jsonb,
  status approval_status_type DEFAULT 'pending',
  decided_by UUID REFERENCES profiles(id),
  reviewer_notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL, -- github, google_drive, slack, discord, telegram
  auth_type VARCHAR(30) DEFAULT 'oauth2',
  status VARCHAR(20) DEFAULT 'connected',
  metadata JSONB DEFAULT '{}'::jsonb,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. ACTIVITY LOGS & USAGE RECORDS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  log_type VARCHAR(30) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  tokens_input INT DEFAULT 0,
  tokens_output INT DEFAULT 0,
  cost_usd NUMERIC(10, 6) DEFAULT 0.000000,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 22. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_agents_org ON ai_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_status ON tasks(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_memories_org_type ON agent_memories(organization_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_approvals_org_status ON approvals(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_activity_org_time ON activity_logs(organization_id, created_at DESC);

-- ====================================================================
-- 23. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check user membership in organization
CREATE OR REPLACE FUNCTION is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = target_org_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Organizations
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Founders can update their organizations"
  ON organizations FOR UPDATE
  USING (is_org_member(id));

-- RLS: AI Agents
CREATE POLICY "Org members can read agents"
  ON ai_agents FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Org members can modify agents"
  ON ai_agents FOR ALL
  USING (is_org_member(organization_id));

-- RLS: Tasks
CREATE POLICY "Org members can manage tasks"
  ON tasks FOR ALL
  USING (is_org_member(organization_id));

-- RLS: Approvals
CREATE POLICY "Org members can view and resolve approvals"
  ON approvals FOR ALL
  USING (is_org_member(organization_id));

-- RLS: Documents
CREATE POLICY "Org members can access documents"
  ON documents FOR ALL
  USING (is_org_member(organization_id));
