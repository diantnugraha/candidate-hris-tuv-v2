import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, LoginRequest } from "@/types";
import { authService } from "@/services/auth.service";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  loginWithDummy: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true });

        try {
          const response = await authService.login(credentials);

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || "Login failed. Please try again.",
            });
            return false;
          }
        } catch {
          set({
            isLoading: false,
            error: "An unexpected error occurred. Please try again.",
          });
          return false;
        }
      },

      // BYPASS: Login with dummy data for development
      loginWithDummy: () => {
        const dummyUser: User = {
          id: "1",
          email: "admin@quohris.com",
          name: "Admin User",
          role: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({
          user: dummyUser,
          token: "dummy-token-for-development",
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: async () => {
        set({ isLoading: true });

        await authService.logout();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const token = authService.getToken();
        const storedUser = authService.getUser();

        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return;
        }

        if (storedUser) {
          set({
            user: storedUser,
            token,
            isAuthenticated: true,
          });
        }

        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            set({
              user: response.data,
              token,
              isAuthenticated: true,
            });
          } else {
            authService.clearAuth();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        } catch {
          // If server check fails, keep using stored data
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
