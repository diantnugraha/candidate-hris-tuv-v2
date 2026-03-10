import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { candidateAuthService } from "@/services/candidate-auth.service";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginCandidate: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  acceptAgreement: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login for candidates with email + password
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await candidateAuthService.login({ email, password });

          if (response.success && response.data) {
            const candidate = response.data.candidate;
            // Map candidate to User type for compatibility
            const user: User = {
              id: candidate.id,
              email: candidate.email,
              name: candidate.fullname || candidate.email,
              role: "candidate",
              candidateCode: candidate.candidateCode,
              agreementAcceptedAt: candidate.agreementAcceptedAt,
              createdAt: candidate.createdAt,
              updatedAt: candidate.updatedAt,
            };
            set({
              user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || "Invalid email or password.",
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

      // Alias for login
      loginCandidate: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await candidateAuthService.login({ email, password });

          if (response.success && response.data) {
            const candidate = response.data.candidate;
            const user: User = {
              id: candidate.id,
              email: candidate.email,
              name: candidate.fullname || candidate.email,
              role: "candidate",
              candidateCode: candidate.candidateCode,
              agreementAcceptedAt: candidate.agreementAcceptedAt,
              createdAt: candidate.createdAt,
              updatedAt: candidate.updatedAt,
            };
            set({
              user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || "Invalid email or password.",
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

      logout: () => {
        candidateAuthService.clearToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const token = candidateAuthService.getToken();

        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return;
        }

        try {
          const response = await candidateAuthService.getProfile();
          if (response.success && response.data) {
            const candidate = response.data;
            const user: User = {
              id: candidate.id,
              email: candidate.email,
              name: candidate.fullname || candidate.email,
              role: "candidate",
              candidateCode: candidate.candidateCode,
              agreementAcceptedAt: candidate.agreementAcceptedAt,
              createdAt: candidate.createdAt,
              updatedAt: candidate.updatedAt,
            };
            set({
              user,
              token,
              isAuthenticated: true,
            });
          } else {
            candidateAuthService.clearToken();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        } catch {
          // If server check fails, keep token but don't update user
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      acceptAgreement: async () => {
        try {
          const response = await candidateAuthService.acceptAgreement("1.0");
          if (response.success && response.data) {
            set((state) => ({
              user: state.user
                ? { ...state.user, agreementAcceptedAt: response.data!.agreementAcceptedAt }
                : null,
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: "candidate-auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
