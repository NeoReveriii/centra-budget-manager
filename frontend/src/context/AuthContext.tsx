import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  authClient,
  persistSessionToken,
  clearPersistedSession,
  requestPasswordReset as sendPasswordResetEmail,
} from '../lib/auth-client';
import { fetchCurrentUser, type UserProfile } from '../lib/api';

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  loginWithSocial: (provider: 'google' | 'apple') => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

async function syncLocalProfile(): Promise<{ user: UserProfile; token: string } | null> {
  const token = await persistSessionToken();
  if (!token) return null;

  const user = await fetchCurrentUser();
  localStorage.setItem('centra_user', JSON.stringify(user));
  return { user, token };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedUser = localStorage.getItem('centra_user');
        const synced = await syncLocalProfile();
        if (synced) {
          setToken(synced.token);
          setUser(synced.user);
          return;
        }

        if (savedUser) {
          clearPersistedSession();
        }
      } catch {
        clearPersistedSession();
        setToken(null);
        setUser(null);
        await authClient.signOut().catch(() => undefined);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email: string, password: string): Promise<AuthResult> {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      return { success: false, error: error.message || 'Login failed' };
    }

    try {
      const synced = await syncLocalProfile();
      if (!synced) {
        return { success: false, error: 'Unable to establish session' };
      }
      setToken(synced.token);
      setUser(synced.user);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: message };
    }
  }

  async function register(username: string, email: string, password: string): Promise<AuthResult> {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: username,
    });
    if (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }

    const signInResult = await authClient.signIn.email({ email, password });
    if (signInResult.error) {
      return { success: false, error: signInResult.error.message || 'Registration succeeded but sign-in failed' };
    }

    try {
      const synced = await syncLocalProfile();
      if (!synced) {
        return { success: false, error: 'Unable to establish session' };
      }
      setToken(synced.token);
      setUser(synced.user);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: message };
    }
  }

  async function loginWithSocial(provider: 'google' | 'apple'): Promise<AuthResult> {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}/dashboard`,
      errorCallbackURL: `${window.location.origin}/`,
    });
    if (error) {
      return { success: false, error: error.message || 'Social sign-in failed' };
    }
    return { success: true };
  }

  async function requestPasswordReset(email: string): Promise<AuthResult> {
    const result = await sendPasswordResetEmail(email);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to send reset email' };
    }
    return { success: true };
  }

  async function logout() {
    clearPersistedSession();
    setToken(null);
    setUser(null);
    await authClient.signOut().catch(() => undefined);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginWithSocial, requestPasswordReset, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
