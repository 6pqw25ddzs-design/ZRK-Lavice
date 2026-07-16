import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from './api';
import { registerPushToken } from './push';

export type Child = {
  id: string; firstName: string; lastName: string; birthDate: string;
  jerseyNumber?: number; position?: string; photoUrl?: string;
  team: { id: string; name: string; category: string };
};
type User = { id: string; email: string; fullName: string; role: string };

type AuthState = {
  user: User | null;
  children: Child[];
  activeChild: Child | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  activate: (code: string, email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveChildId: (id: string) => void;
  refreshChildren: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = 'lavice_token';
const USER_KEY = 'lavice_user';

export function AuthProvider({ children: nodes }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [kids, setKids] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadChildren() {
    try {
      const links = await api.myChildren();
      const list: Child[] = links.map((l: any) => l.player);
      setKids(list);
      setActiveChildId(prev => (prev && list.some(k => k.id === prev) ? prev : list[0]?.id ?? null));
    } catch {
      // token istekao ili mreža — ne ruši app
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const [token, rawUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (token && rawUser) {
          setAuthToken(token);
          setUser(JSON.parse(rawUser));
          await loadChildren();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(token: string, u: User) {
    setAuthToken(token);
    setUser(u);
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(u)),
    ]);
    await loadChildren();
    registerPushToken(); // fire-and-forget
  }

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    await persist(res.token, res.user);
  }

  async function activate(code: string, email: string, password: string, fullName: string, phone?: string) {
    const res = await api.activate({ code, email, password, fullName, phone });
    await persist(res.token, res.user);
  }

  async function logout() {
    setAuthToken(null);
    setUser(null);
    setKids([]);
    setActiveChildId(null);
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  }

  const activeChild = kids.find(k => k.id === activeChildId) ?? null;

  return (
    <AuthContext.Provider value={{
      user, children: kids, activeChild, loading,
      login, activate, logout,
      setActiveChildId, refreshChildren: loadChildren,
    }}>
      {nodes}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth mora biti unutar AuthProvider');
  return ctx;
}
