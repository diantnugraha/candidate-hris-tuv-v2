"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check both Zustand state and actual localStorage
    const storedData = localStorage.getItem("candidate-auth-store");
    const hasStoredAuth = (() => {
      if (!storedData) return false;
      try {
        const parsed = JSON.parse(storedData);
        return !!parsed?.state?.token;
      } catch {
        return false;
      }
    })();

    if (!isAuthenticated || !token || !hasStoredAuth) {
      // Clear Zustand state if storage was cleared externally
      if (!hasStoredAuth && isAuthenticated) {
        useAuthStore.getState().logout();
      }
      router.replace("/login");
      return;
    }

    setIsChecking(false);
  }, [isAuthenticated, token, router]);

  // Listen for storage changes (cleared from another tab or DevTools)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "candidate-auth-store" || e.key === null) {
        // e.key === null means storage was cleared entirely
        const storedData = localStorage.getItem("candidate-auth-store");
        if (!storedData) {
          useAuthStore.getState().logout();
          router.replace("/login");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      {children}
    </div>
  );
}
