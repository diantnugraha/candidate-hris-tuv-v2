import { useState, useCallback, useEffect, useRef } from "react";

import { candidateAuthService } from "@/services/candidate-auth.service";
import { candidateProfileService, type PersonalInfoFormData, type AssessmentFormData } from "@/services/candidate-profile.service";
import type { EducationalBackground, WorkExperience, FamilyMember, CourseTraining } from "@/types";

// --- Constants ---

const STORAGE_KEY_PREFIX = "candidate_profile_draft_";
const SUBMISSION_KEY_PREFIX = "candidate_application_submitted_";

// Get user-specific storage key
function getStorageKey(candidateId: number | string): string {
  return `${STORAGE_KEY_PREFIX}${candidateId}`;
}

function getSubmissionKey(candidateId: number | string): string {
  return `${SUBMISSION_KEY_PREFIX}${candidateId}`;
}

// --- Types ---

export interface CandidateProfileData {
  personalInfo: PersonalInfoFormData;
  education: EducationalBackground[];
  workExperience: WorkExperience[];
  family: FamilyMember[];
  training: CourseTraining[];
  assessment: AssessmentFormData;
}

export interface DirtyState {
  personalInfo: boolean;
  education: boolean;
  workExperience: boolean;
  family: boolean;
  training: boolean;
  assessment: boolean;
}

type SectionKey = keyof DirtyState;

// --- Initial Values ---

const initialPersonalInfo: PersonalInfoFormData = {
  fullName: "",
  idNumber: "",
  taxIdNumber: "",
  nationality: "",
  bpjsNumber: "",
  religion: "",
  mobilePhone: "",
  address: "",
  personalEmail: "",
  domicileAddress: "",
  drivingLicense: "",
  birthPlace: "",
  residentialStatus: "",
  birthDate: "",
  uniformShirtSize: "",
  maritalStatus: "",
  uniformPantsSize: "",
};

const initialAssessment: AssessmentFormData = {
  reasonLeavingLastJob: "",
  lastJobDescription: "",
  reasonApplying: "",
  relevantSkills: "",
  lastSalary: "",
  expectedSalary: "",
  activeLanguage: "",
  willingToTransfer: "",
  willingToDoubleWork: "",
  knownEmployees: "",
  readyToWork: "",
  employeeRelationship: "",
  referenceContactName: "",
  referenceContactPhone: "",
};

const initialDirtyState: DirtyState = {
  personalInfo: false,
  education: false,
  workExperience: false,
  family: false,
  training: false,
  assessment: false,
};

// --- Helper Functions ---

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function loadFromStorage(candidateId: number | string | undefined): Partial<CandidateProfileData> | null {
  if (typeof window === "undefined" || !candidateId) return null;
  try {
    const stored = localStorage.getItem(getStorageKey(candidateId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveToStorage(candidateId: number | string | undefined, data: CandidateProfileData): void {
  if (typeof window === "undefined" || !candidateId) return;
  try {
    localStorage.setItem(getStorageKey(candidateId), JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function clearStorage(candidateId: number | string | undefined): void {
  if (typeof window === "undefined" || !candidateId) return;
  localStorage.removeItem(getStorageKey(candidateId));
}

function loadSubmissionStatus(candidateId: number | string | undefined): boolean {
  if (typeof window === "undefined" || !candidateId) return false;
  try {
    const stored = localStorage.getItem(getSubmissionKey(candidateId));
    if (stored) {
      const data = JSON.parse(stored);
      return data.submitted === true;
    }
  } catch {
    // Ignore parse errors
  }
  return false;
}

function saveSubmissionStatus(candidateId: number | string | undefined): void {
  if (typeof window === "undefined" || !candidateId) return;
  localStorage.setItem(getSubmissionKey(candidateId), JSON.stringify({ submitted: true, submittedAt: new Date().toISOString() }));
}

// --- Hook ---

export function useCandidateProfile(candidateId?: number | string) {
  // Current form data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoFormData>(initialPersonalInfo);
  const [education, setEducation] = useState<EducationalBackground[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [training, setTraining] = useState<CourseTraining[]>([]);
  const [assessment, setAssessment] = useState<AssessmentFormData>(initialAssessment);

  // Initial data from API (for dirty comparison)
  const initialDataRef = useRef<CandidateProfileData>({
    personalInfo: initialPersonalInfo,
    education: [],
    workExperience: [],
    family: [],
    training: [],
    assessment: initialAssessment,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Dirty state per section
  const [dirtyState, setDirtyState] = useState<DirtyState>(initialDirtyState);

  // Check if any section is dirty
  const hasUnsavedChanges = Object.values(dirtyState).some(Boolean);

  // Submission state (persisted per user in localStorage)
  const [isSubmitted, setIsSubmitted] = useState(() => loadSubmissionStatus(candidateId));

  // Update submission state when candidateId changes
  useEffect(() => {
    if (candidateId) {
      setIsSubmitted(loadSubmissionStatus(candidateId));
    }
  }, [candidateId]);

  // --- Data Loading ---

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // Fetch all sections from backend in parallel
      const [profileRes, educationRes, experienceRes, familyRes, trainingRes, assessmentRes] =
        await Promise.all([
          candidateAuthService.getProfile(),
          candidateProfileService.getEducation(),
          candidateProfileService.getWorkExperience(),
          candidateProfileService.getFamily(),
          candidateProfileService.getTraining(),
          candidateProfileService.getAssessment(),
        ]);

      // Map profile response to PersonalInfoFormData
      let loadedPersonalInfo = initialPersonalInfo;
      if (profileRes.success && profileRes.data) {
        const c = profileRes.data;

        // Derive submission status from backend (source of truth)
        if (c.isSubmitted) {
          setIsSubmitted(true);
          saveSubmissionStatus(candidateId);
        }
        loadedPersonalInfo = {
          fullName: c.fullname || "",
          idNumber: c.idNo || "",
          taxIdNumber: c.taxId || "",
          nationality: c.citizenship || "",
          bpjsNumber: c.bpjsId || "",
          religion: c.religion || "",
          mobilePhone: c.mobilePhone || "",
          address: c.address || "",
          personalEmail: c.email || "",
          domicileAddress: c.domicileAddress || "",
          drivingLicense: c.drivingLicense || "",
          birthPlace: c.birthPlace || "",
          residentialStatus: c.residentStatus?.toLowerCase() || "",
          birthDate: c.birthDate || "",
          uniformShirtSize: c.uniformShirtSize?.toLowerCase() || "",
          maritalStatus: c.marritalStatus?.toLowerCase() || "",
          uniformPantsSize: c.uniformPantsSize?.toLowerCase() || "",
        };
      }

      // Extract data from API responses
      const loadedEducation = educationRes.success ? (educationRes.data || []) : [];
      const loadedExperience = experienceRes.success ? (experienceRes.data || []) : [];
      const loadedFamily = familyRes.success ? (familyRes.data || []) : [];
      const loadedTraining = trainingRes.success ? (trainingRes.data || []) : [];
      // Assessment data is already mapped to camelCase by the service
      const loadedAssessment = assessmentRes.success && assessmentRes.data
        ? assessmentRes.data
        : initialAssessment;

      // Check localStorage for draft data (overrides backend if present)
      const storedDraft = loadFromStorage(candidateId);

      // Use draft data if available, otherwise use backend data
      const finalPersonalInfo = storedDraft?.personalInfo || loadedPersonalInfo;
      const finalEducation = storedDraft?.education || loadedEducation;
      const finalExperience = storedDraft?.workExperience || loadedExperience;
      const finalFamily = storedDraft?.family || loadedFamily;
      const finalTraining = storedDraft?.training || loadedTraining;
      const finalAssessment = storedDraft?.assessment || loadedAssessment;

      // Set current state
      setPersonalInfo(finalPersonalInfo);
      setEducation(finalEducation);
      setWorkExperience(finalExperience);
      setFamily(finalFamily);
      setTraining(finalTraining);
      setAssessment(finalAssessment);

      // Store initial data (from backend) for dirty comparison
      initialDataRef.current = {
        personalInfo: loadedPersonalInfo,
        education: loadedEducation,
        workExperience: loadedExperience,
        family: loadedFamily,
        training: loadedTraining,
        assessment: loadedAssessment,
      };

      // Calculate initial dirty state (draft differs from backend)
      setDirtyState({
        personalInfo: !deepEqual(finalPersonalInfo, loadedPersonalInfo),
        education: !deepEqual(finalEducation, loadedEducation),
        workExperience: !deepEqual(finalExperience, loadedExperience),
        family: !deepEqual(finalFamily, loadedFamily),
        training: !deepEqual(finalTraining, loadedTraining),
        assessment: !deepEqual(finalAssessment, loadedAssessment),
      });
    } catch {
      setLoadError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  // Load data on mount (wait for candidateId to be available)
  useEffect(() => {
    if (candidateId) {
      fetchAllData();
    }
  }, [candidateId, fetchAllData]);

  // --- Dirty Tracking ---

  const markDirty = useCallback((section: SectionKey) => {
    setDirtyState((prev) => ({ ...prev, [section]: true }));
  }, []);

  const markClean = useCallback((section: SectionKey) => {
    setDirtyState((prev) => ({ ...prev, [section]: false }));
  }, []);

  const markAllClean = useCallback(() => {
    setDirtyState(initialDirtyState);
  }, []);

  // --- Update Functions with Dirty Tracking ---

  const updatePersonalInfo = useCallback(
    (field: keyof PersonalInfoFormData, value: string) => {
      setPersonalInfo((prev) => {
        const updated = { ...prev, [field]: value };
        // Check if different from initial
        if (!deepEqual(updated, initialDataRef.current.personalInfo)) {
          markDirty("personalInfo");
        } else {
          markClean("personalInfo");
        }
        return updated;
      });
    },
    [markDirty, markClean]
  );

  const setPersonalInfoBatch = useCallback(
    (data: Partial<PersonalInfoFormData>) => {
      setPersonalInfo((prev) => {
        const updated = { ...prev, ...data };
        if (!deepEqual(updated, initialDataRef.current.personalInfo)) {
          markDirty("personalInfo");
        } else {
          markClean("personalInfo");
        }
        return updated;
      });
    },
    [markDirty, markClean]
  );

  const updateEducation = useCallback(
    (data: EducationalBackground[]) => {
      setEducation(data);
      if (!deepEqual(data, initialDataRef.current.education)) {
        markDirty("education");
      } else {
        markClean("education");
      }
    },
    [markDirty, markClean]
  );

  const updateWorkExperience = useCallback(
    (data: WorkExperience[]) => {
      setWorkExperience(data);
      if (!deepEqual(data, initialDataRef.current.workExperience)) {
        markDirty("workExperience");
      } else {
        markClean("workExperience");
      }
    },
    [markDirty, markClean]
  );

  const updateFamily = useCallback(
    (data: FamilyMember[]) => {
      setFamily(data);
      if (!deepEqual(data, initialDataRef.current.family)) {
        markDirty("family");
      } else {
        markClean("family");
      }
    },
    [markDirty, markClean]
  );

  const updateTraining = useCallback(
    (data: CourseTraining[]) => {
      setTraining(data);
      if (!deepEqual(data, initialDataRef.current.training)) {
        markDirty("training");
      } else {
        markClean("training");
      }
    },
    [markDirty, markClean]
  );

  const updateAssessment = useCallback(
    (field: keyof AssessmentFormData, value: string) => {
      setAssessment((prev) => {
        const updated = { ...prev, [field]: value };
        if (!deepEqual(updated, initialDataRef.current.assessment)) {
          markDirty("assessment");
        } else {
          markClean("assessment");
        }
        return updated;
      });
    },
    [markDirty, markClean]
  );

  // --- localStorage Auto-save ---

  useEffect(() => {
    if (!isLoading && hasUnsavedChanges && candidateId) {
      saveToStorage(candidateId, {
        personalInfo,
        education,
        workExperience,
        family,
        training,
        assessment,
      });
    }
  }, [isLoading, hasUnsavedChanges, candidateId, personalInfo, education, workExperience, family, training, assessment]);

  // --- Save Functions ---

  const saveSection = useCallback(
    async (section: SectionKey): Promise<{ success: boolean; message?: string }> => {
      if (!dirtyState[section]) {
        return { success: true, message: "No changes to save" };
      }

      setIsSaving(true);
      try {
        let result: { success: boolean; message?: string };

        switch (section) {
          case "personalInfo":
            result = await candidateProfileService.savePersonalInfo(personalInfo);
            break;
          case "education":
            result = await candidateProfileService.saveEducation(education);
            break;
          case "workExperience":
            result = await candidateProfileService.saveWorkExperience(workExperience);
            break;
          case "family":
            result = await candidateProfileService.saveFamily(family);
            break;
          case "training":
            result = await candidateProfileService.saveTraining(training);
            break;
          case "assessment":
            result = await candidateProfileService.saveAssessment(assessment);
            break;
          default:
            result = { success: false, message: "Unknown section" };
        }

        if (result.success) {
          markClean(section);
          // Update initial data ref
          initialDataRef.current = {
            ...initialDataRef.current,
            [section]:
              section === "personalInfo"
                ? personalInfo
                : section === "education"
                ? education
                : section === "workExperience"
                ? workExperience
                : section === "family"
                ? family
                : section === "training"
                ? training
                : assessment,
          };
        }

        return result;
      } finally {
        setIsSaving(false);
      }
    },
    [dirtyState, personalInfo, education, workExperience, family, training, assessment, markClean]
  );

  const submitApplication = useCallback(async (): Promise<{
    success: boolean;
    errors: string[];
  }> => {
    setIsSaving(true);
    try {
      // Save ALL data when submitting (no dirty tracking - ensures nothing is lost)
      const result = await candidateProfileService.submitApplication({
        personalInfo,
        education,
        workExperience,
        family,
        training,
        assessment,
      });

      if (result.success) {
        markAllClean();
        clearStorage(candidateId);
        saveSubmissionStatus(candidateId);
        setIsSubmitted(true);
        // Update initial data ref to current values
        initialDataRef.current = {
          personalInfo,
          education,
          workExperience,
          family,
          training,
          assessment,
        };
      }

      return result;
    } finally {
      setIsSaving(false);
    }
  }, [candidateId, personalInfo, education, workExperience, family, training, assessment, markAllClean]);

  const saveDraft = useCallback(async (): Promise<{ success: boolean; errors: string[] }> => {
    // Save to localStorage only (not to backend)
    // Data is auto-saved to localStorage via useEffect
    saveToStorage(candidateId, {
      personalInfo,
      education,
      workExperience,
      family,
      training,
      assessment,
    });
    return { success: true, errors: [] };
  }, [candidateId, personalInfo, education, workExperience, family, training, assessment]);

  const discardChanges = useCallback(() => {
    // Restore from initial data
    setPersonalInfo(initialDataRef.current.personalInfo);
    setEducation(initialDataRef.current.education);
    setWorkExperience(initialDataRef.current.workExperience);
    setFamily(initialDataRef.current.family);
    setTraining(initialDataRef.current.training);
    setAssessment(initialDataRef.current.assessment);
    markAllClean();
    clearStorage(candidateId);
  }, [candidateId, markAllClean]);

  // --- Unsaved Changes Warning ---

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    // Data
    personalInfo,
    education,
    workExperience,
    family,
    training,
    assessment,

    // Update functions
    updatePersonalInfo,
    setPersonalInfoBatch,
    updateEducation,
    updateWorkExperience,
    updateFamily,
    updateTraining,
    updateAssessment,

    // State
    isLoading,
    isSaving,
    loadError,
    dirtyState,
    hasUnsavedChanges,
    isSubmitted,

    // Actions
    saveSection,
    saveDraft,
    submitApplication,
    discardChanges,
    refetch: fetchAllData,
  };
}

export default useCandidateProfile;
