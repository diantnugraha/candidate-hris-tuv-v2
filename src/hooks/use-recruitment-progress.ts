import { useState, useEffect, useCallback } from "react";

import { candidateProfileService } from "@/services/candidate-profile.service";
import type { InterviewProgress, McuStatus, OnboardingData } from "@/types";

export interface RecruitmentProgressData {
  interview: InterviewProgress | null;
  mcu: McuStatus | null;
  onboarding: OnboardingData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecruitmentProgress(
  candidateId: number | string | undefined,
  isSubmitted: boolean
): RecruitmentProgressData {
  const [interview, setInterview] = useState<InterviewProgress | null>(null);
  const [mcu, setMcu] = useState<McuStatus | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!candidateId || !isSubmitted) return;

    setIsLoading(true);
    setError(null);

    try {
      const [interviewRes, mcuRes, onboardingRes] = await Promise.all([
        candidateProfileService.getInterviewProgress(),
        candidateProfileService.getMcuStatus(),
        candidateProfileService.getOnboarding(),
      ]);

      if (interviewRes.success) setInterview(interviewRes.data ?? null);
      if (mcuRes.success) setMcu(mcuRes.data ?? null);
      if (onboardingRes.success) setOnboarding(onboardingRes.data ?? null);
    } catch {
      setError("Failed to load recruitment progress");
    } finally {
      setIsLoading(false);
    }
  }, [candidateId, isSubmitted]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    interview,
    mcu,
    onboarding,
    isLoading,
    error,
    refetch: fetchProgress,
  };
}

export default useRecruitmentProgress;
