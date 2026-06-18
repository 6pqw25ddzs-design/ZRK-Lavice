import { create } from 'zustand';

type User = { id: string; email: string; fullName: string; role: string };

type AuthStore = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  init: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,

  init: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('zrk_token');
    const raw = localStorage.getItem('zrk_user');
    if (token && raw) set({ token, user: JSON.parse(raw) });
  },

  login: (user, token) => {
    localStorage.setItem('zrk_token', token);
    localStorage.setItem('zrk_user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('zrk_token');
    localStorage.removeItem('zrk_user');
    set({ user: null, token: null });
  },
}));
