import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginUser, registerUser, type LoginResponse } from '../lib/api';

interface User {
  acc_id: number;
  username: string;
  email: string;
  pnumber: string | null;
  bio: string | null;
  avatar_seed: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (username: string, email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('centra_token');
    const savedUser = localStorage.getItem('centra_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('centra_token');
        localStorage.removeItem('centra_user');
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await loginUser(email, password);
    if (res.success && res.token) {
      localStorage.setItem('centra_token', res.token);
      localStorage.setItem('centra_user', JSON.stringify(res.data));
      setToken(res.token);
      setUser(res.data as User);
    }
    return res;
  }

  async function register(username: string, email: string, password: string) {
    // Register the account first
    await registerUser(username, email, password);
    // Then auto-login so the user is immediately authenticated
    const res = await loginUser(email, password);
    if (res.success && res.token) {
      localStorage.setItem('centra_token', res.token);
      localStorage.setItem('centra_user', JSON.stringify(res.data));
      setToken(res.token);
      setUser(res.data as User);
    }
    return res;
  }

  function logout() {
    localStorage.removeItem('centra_token');
    localStorage.removeItem('centra_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

