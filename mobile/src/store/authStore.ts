import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'parent' | 'coach' | 'admin';
};

type AuthStore = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,

  login: async (user, token) => {
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ user, token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, token: null });
  },

  init: async () => {
    const token = await SecureStore.getItemAsync('token');
    const userStr = await SecureStore.getItemAsync('user');
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) });
    }
  },
}));
