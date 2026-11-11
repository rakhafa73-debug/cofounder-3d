import React, { useState } from 'react';
import { 
  X, Lock, Mail, User, ShieldCheck, Database, 
  CheckCircle2, AlertTriangle, Key, ExternalLink, LogOut
} from 'lucide-react';
import { AppUser, authenticateUser, getSupabaseConfig, saveSupabaseConfig, signOutUser } from '../lib/supabase';
import { playSound } from '../three/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserChanged: (user: AppUser | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'supabase_config'>('signin');
  const [email, setEmail] = useState(currentUser?.email || 'rakhafa73@gmail.com');
  const [password, setPassword] = useState('FounderPass123!');
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Master Founder');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supabase Config form state
  const config = getSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(config.url || '');
  const [sbKey, setSbKey] = useState(config.key || '');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    playSound.click();

    try {
      const result = await authenticateUser(mode as 'signin' | 'signup', email, password, fullName);
      if (result.success) {
        playSound.success();
        onUserChanged(result.user);
        onClose();
      } else {
        setErrorMessage(result.message || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig(sbUrl, sbKey);
    setTestResult('Configuration saved successfully. Supabase client initialized.');
    playSound.success();
  };

  const handleSignOut = async () => {
    await signOutUser();
    onUserChanged(null);
    playSound.click();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0D1222] border border-white/15 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentUser ? 'Founder Account & Supabase' : mode === 'signin' ? 'Sign In as Founder' : 'Create Founder Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser ? 'Authenticated Session & PostgreSQL Connection' : 'Access your autonomous C-suite team'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers if not logged in */}
        {!currentUser && (
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => { setMode('signin'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                mode === 'signin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                mode === 'signup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('supabase_config'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                mode === 'supabase_config' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Supabase Keys
            </button>
          </div>
        )}

        {/* Logged in state display */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow">
                  FD
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{currentUser.fullName}</div>
                  <div className="text-xs text-slate-400">{currentUser.email}</div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-1">
                    ROLE: {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Supabase status */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Supabase PostgreSQL Status</span>
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                  config.isConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {config.isConfigured ? 'CONNECTED' : 'LOCAL CACHE READY'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                22 relational tables with Row Level Security (RLS) configured in <code className="text-cyan-300">001_cofounder_schema.sql</code>.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setMode('supabase_config')}
                className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configure Supabase Keys</span>
              </button>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 text-xs font-semibold border border-white/10 transition flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : mode === 'supabase_config' ? (
          /* Supabase Direct Key Configuration */
          <div className="space-y-4">
            <div className="text-xs text-slate-300 leading-relaxed">
              Connect your live Supabase cloud project. You can find these in your Supabase Dashboard under <strong>Project Settings &gt; API</strong>.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Supabase Anon / Public Key
                </label>
                <input
                  type="password"
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {testResult && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
                {testResult}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Sign In
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Save & Initialize
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Founder Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition"
            >
              {isSubmitting ? 'Authenticating...' : mode === 'signin' ? 'Sign In as Founder' : 'Register Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
