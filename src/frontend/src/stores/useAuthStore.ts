import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  initialize: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  isInitializing: false,

  initialize: async () => {
    // Auth removed — always authenticated
    set({ isAuthenticated: true, isInitializing: false });
  },

  login: async () => {
    set({ isAuthenticated: true });
  },

  logout: async () => {
    set({ isAuthenticated: false });
  },
}));
