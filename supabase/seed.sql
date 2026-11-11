-- ====================================================================
-- COFOUNDER 3D: SEED DATA FOR 5 C-SUITE EXECUTIVES & DEFAULT ORG
-- ====================================================================

-- 1. Insert Supported Models
INSERT INTO agent_models (id, provider, model_name, context_window, cost_per_1m_input, cost_per_1m_output)
VALUES 
  ('gemini-3.8-flash', 'gemini', 'Gemini 3.8 Flash (Ultra-Low Latency & Reasoning)', 1000000, 0.15, 0.60),
  ('gemini-4-carbon', 'gemini', 'Gemini 4 Carbon (Deep Reasoning & Research)', 1000000, 1.25, 5.00),
  ('claude-3-7-sonnet', 'anthropic', 'Claude 3.7 Sonnet (Hybrid Thinking)', 200000, 3.00, 15.00),
  ('gpt-4o', 'openai', 'GPT-4o Omnimodal Enterprise', 128000, 2.50, 10.00)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Agent Roles
INSERT INTO agent_roles (id, name, department, description, default_permissions)
VALUES
  ('ceo', 'Chief Executive Officer', 'Executive Suite', 'Strategic company governance, task breakdown, and executive evaluation', '{"all_projects_read_write", "delegation_authority", "meeting_host"}'),
  ('cto', 'Chief Technology Officer', 'Engineering & R&D', 'Software architecture, database schemas, code generation and system stability', '{"codebase_read_write", "database_admin", "infra_config"}'),
  ('coo', 'Chief Operating Officer', 'Operations & Process', 'SOPs, agile pipelines, resource bandwidth, and execution quality assurance', '{"workflow_admin", "sprint_management", "qa_approval"}'),
  ('cfo', 'Chief Financial Officer', 'Finance & Compliance', '12-36 month financial forecasts, unit economics, runway audit, and budget gatekeeping', '{"budget_review", "pricing_admin", "financial_reporting"}'),
  ('cmo', 'Chief Marketing Officer', 'Growth & Brand', 'Go-to-market strategy, product launches, copywriting, and conversion funnels', '{"brand_assets_admin", "campaign_deploy", "social_playbook"}')
ON CONFLICT (id) DO NOTHING;
