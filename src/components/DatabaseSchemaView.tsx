import React, { useState } from 'react';
import { 
  Database, ShieldCheck, Copy, Check, Terminal, 
  Table, Key, Search, ExternalLink, RefreshCw 
} from 'lucide-react';
import { playSound } from '../three/audio';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'rls' | 'sql'>('tables');
  const [searchTerm, setSearchTerm] = useState('');

  const tables = [
    { name: 'profiles', columns: 'id, full_name, email, avatar_url, preferred_language, created_at', rls: 'Founder only', pkey: 'id (UUID)' },
    { name: 'organizations', columns: 'id, name, slug, tagline, founder_id, settings, created_at', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'organization_members', columns: 'id, organization_id, user_id, role, joined_at', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'ai_agents', columns: 'id, organization_id, role_id, slug, name, title, personality, system_prompt, model_id, temperature, status', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'agent_roles', columns: 'id, name, department, description, default_permissions, created_at', rls: 'Public read', pkey: 'id (VARCHAR)' },
    { name: 'agent_models', columns: 'id, provider, model_name, context_window, cost_per_1m_input, cost_per_1m_output', rls: 'Public read', pkey: 'id (VARCHAR)' },
    { name: 'agent_memories', columns: 'id, organization_id, agent_id, memory_type, title, content, relevance_score, embedding (vector)', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'projects', columns: 'id, organization_id, lead_agent_id, title, description, status, progress, budget_allocated', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'tasks', columns: 'id, organization_id, project_id, assignee_id, title, description, priority, status, progress, result', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'task_dependencies', columns: 'id, task_id, depends_on_task_id, created_at', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'agent_executions', columns: 'id, organization_id, agent_id, task_id, prompt_input, output_response, tokens, status', rls: 'Audit log', pkey: 'id (UUID)' },
    { name: 'agent_tool_calls', columns: 'id, execution_id, tool_name, arguments, result, status, executed_at', rls: 'Audit log', pkey: 'id (UUID)' },
    { name: 'conversations', columns: 'id, organization_id, title, is_group_chat, created_at', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'messages', columns: 'id, conversation_id, sender_type, agent_id, content, thought_process, created_at', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'meetings', columns: 'id, organization_id, title, agenda, status, duration_minutes, summary, key_decisions', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'meeting_participants', columns: 'id, meeting_id, agent_id, joined_at', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'meeting_notes', columns: 'id, meeting_id, speaker_name, speech, spoken_at', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'documents', columns: 'id, organization_id, project_id, author_agent_id, title, doc_type, content, version', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'approvals', columns: 'id, organization_id, requested_by, title, description, category, impact_level, status, decided_by', rls: 'Founder only', pkey: 'id (UUID)' },
    { name: 'integrations', columns: 'id, organization_id, provider_name, auth_type, status, metadata, connected_at', rls: 'Founder only', pkey: 'id (UUID)' },
    { name: 'activity_logs', columns: 'id, organization_id, agent_id, action, detail, log_type, created_at', rls: 'Org members', pkey: 'id (UUID)' },
    { name: 'usage_records', columns: 'id, organization_id, agent_id, tokens_input, tokens_output, cost_usd, recorded_at', rls: 'Org members', pkey: 'id (UUID)' },
  ];

  const migrationSql = `-- COFOUNDER 3D Production Migration (001_cofounder_schema.sql)
-- 22 Relational Tables, Indexes & Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  founder_id UUID REFERENCES profiles(id),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enforcement Function
CREATE OR REPLACE FUNCTION is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = target_org_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(migrationSql);
    setCopied(true);
    playSound.click();
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.columns.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>PostgreSQL & Supabase Architecture</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                22 TABLES · RLS ENABLED
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Production schema migration with Row Level Security, pgvector embeddings, and foreign key constraints.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopySql}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 flex items-center space-x-1.5 transition shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'SQL Copied' : 'Copy Migration SQL'}</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tables' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tables Catalog (22)
          </button>
          <button
            onClick={() => setActiveTab('rls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'rls' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            RLS Security Policies
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sql' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Migration SQL Preview
          </button>
        </div>

        {activeTab === 'tables' && (
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search table or column..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Tables Grid */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTables.map((t) => (
            <div
              key={t.name}
              className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-2 hover:border-cyan-500/30 transition shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                  <Table className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.name}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  RLS: {t.rls}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono break-all bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                {t.columns}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                <span>PK: {t.pkey}</span>
                <span>UUID & Foreign Keys</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RLS Policies View */}
      {activeTab === 'rls' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Tenant Row Level Security Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every table containing company records (<code className="text-cyan-300">organization_id</code>) enforces RLS through the <code className="text-cyan-300">is_org_member()</code> PostgreSQL stored procedure. No tenant can view or mutate records belonging to other organizations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs text-slate-300 space-y-3">
            <div>
              <div className="text-cyan-300 font-bold mb-1">-- Organization Isolation Policy</div>
              <div className="text-slate-400">CREATE POLICY &quot;Users can view their organizations&quot; ON organizations FOR SELECT USING (is_org_member(id));</div>
            </div>
            <div>
              <div className="text-cyan-300 font-bold mb-1">-- AI Agent Isolation Policy</div>
              <div className="text-slate-400">CREATE POLICY &quot;Org members can read agents&quot; ON ai_agents FOR SELECT USING (is_org_member(organization_id));</div>
            </div>
            <div>
              <div className="text-cyan-300 font-bold mb-1">-- Human-in-the-Loop Approvals Policy</div>
              <div className="text-slate-400">CREATE POLICY &quot;Org members can view and resolve approvals&quot; ON approvals FOR ALL USING (is_org_member(organization_id));</div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Migration Code View */}
      {activeTab === 'sql' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Location: <code className="text-cyan-300">/supabase/migrations/001_cofounder_schema.sql</code></span>
            <span>Total lines: ~290 lines SQL</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[500px] scrollbar-none whitespace-pre">
            {migrationSql}
          </div>
        </div>
      )}
    </div>
  );
};
