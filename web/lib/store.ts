import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "startup" | "investor" | "admin" | "STARTUP" | "INVESTOR" | "ADMIN";
  avatar?: string;
  onboardingCompleted: boolean;
  profileId?: string | null;
  isProfileCompleted?: boolean;
  isVerified: boolean;
  verificationStatus?: string;
  isPublic?: boolean;
  location?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken, loading: false }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null, refreshToken: null, loading: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setLoading: (loading) => set({ loading }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      }
    }
  )
);
