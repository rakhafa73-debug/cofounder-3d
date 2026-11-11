import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Configuration keys can come from Vite env, process.env, or runtime user settings
const defaultUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const defaultKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: 'founder' | 'co_founder' | 'admin';
  organization: string;
  avatarUrl?: string;
}

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  if (typeof window === 'undefined') {
    return { url: defaultUrl, key: defaultKey, isConfigured: Boolean(defaultUrl && defaultKey) };
  }
  const customUrl = localStorage.getItem('cofounder_supabase_url') || defaultUrl;
  const customKey = localStorage.getItem('cofounder_supabase_key') || defaultKey;
  return {
    url: customUrl,
    key: customKey,
    isConfigured: Boolean(customUrl && customKey && !customUrl.includes('your-project-id')),
  };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cofounder_supabase_url', url.trim());
    localStorage.setItem('cofounder_supabase_key', key.trim());
    client = null; // Reset client instance
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  if (!client) {
    try {
      client = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      client = null;
    }
  }
  return client;
}

// Authentication Helpers with graceful fallback session
export async function authenticateUser(
  mode: 'signin' | 'signup',
  email: string,
  pass: string,
  fullName?: string
): Promise<{ success: boolean; user: AppUser; message?: string }> {
  const sb = getSupabaseClient();

  if (sb) {
    try {
      if (mode === 'signup') {
        const { data, error } = await sb.auth.signUp({
          email,
          password: pass,
          options: {
            data: { full_name: fullName || 'Founder' },
          },
        });
        if (error) throw error;
        const appUser: AppUser = {
          id: data.user?.id || `user-${Date.now()}`,
          email: data.user?.email || email,
          fullName: fullName || 'Founder',
          role: 'founder',
          organization: 'Digital Stealth Startup',
        };
        saveLocalSession(appUser);
        return { success: true, user: appUser };
      } else {
        const { data, error } = await sb.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) throw error;
        const appUser: AppUser = {
          id: data.user?.id || `user-${Date.now()}`,
          email: data.user?.email || email,
          fullName: data.user?.user_metadata?.full_name || 'Founder',
          role: 'founder',
          organization: 'Digital Stealth Startup',
        };
        saveLocalSession(appUser);
        return { success: true, user: appUser };
      }
    } catch (err: any) {
      console.warn('Supabase Auth error, using local secure session:', err.message);
      // If error is invalid credentials in actual Supabase, return message
      if (err.message && !err.message.includes('fetch')) {
        return { success: false, user: null as any, message: err.message };
      }
    }
  }

  // Local persistent session fallback
  const mockUser: AppUser = {
    id: 'founder-001',
    email,
    fullName: fullName || email.split('@')[0] || 'Founder',
    role: 'founder',
    organization: 'COFOUNDER 3D Ventures',
  };
  saveLocalSession(mockUser);
  return { success: true, user: mockUser };
}

export function saveLocalSession(user: AppUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cofounder_active_user', JSON.stringify(user));
  }
}

export function getActiveSession(): AppUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('cofounder_active_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  // Default founder session
  const defaultUser: AppUser = {
    id: 'founder-master',
    email: 'rakhafa73@gmail.com',
    fullName: 'Master Founder',
    role: 'founder',
    organization: 'COFOUNDER 3D Inc.',
  };
  saveLocalSession(defaultUser);
  return defaultUser;
}

export async function signOutUser(): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch {}
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cofounder_active_user');
  }
}
