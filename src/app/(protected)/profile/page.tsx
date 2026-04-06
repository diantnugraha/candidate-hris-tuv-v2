"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  GraduationCap,
  Briefcase,
  Users,
  Award,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  Loader2,
  Save,
  Pencil,
  ClipboardList,
  HeartPulse,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Shield,
  UserCheck,
  MapPin,
  Package,
  BookOpen,
  Lock,
  Video,
  HandshakeIcon,
  FileText,
  Download,
  ScrollText,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { useCandidateProfile } from "@/hooks/use-candidate-profile";
import { useRecruitmentProgress } from "@/hooks/use-recruitment-progress";
import { candidateProfileService } from "@/services/candidate-profile.service";
import type {
  EducationalBackground,
  WorkExperience,
  FamilyMember,
  CourseTraining,
} from "@/types";

const STEPS = [
  { id: 0, label: "Agreement", icon: ScrollText, description: "Data consent agreement" },
  { id: 1, label: "Personal Info", icon: User, description: "Basic details & identity" },
  { id: 2, label: "Education", icon: GraduationCap, description: "Academic background" },
  { id: 3, label: "Experience", icon: Briefcase, description: "Work history" },
  { id: 4, label: "Family", icon: Users, description: "Family composition" },
  { id: 5, label: "Training", icon: Award, description: "Courses & certifications" },
  { id: 6, label: "Assessment", icon: ClipboardList, description: "Self assessment & preferences" },
  { id: 7, label: "Interview", icon: Video, description: "Interview process & result" },
  { id: 8, label: "MCU", icon: HeartPulse, description: "Medical check-up status" },
  { id: 9, label: "Onboarding", icon: Building2, description: "Onboarding details" },
] as const;

// No more dummy data — interview, MCU, and onboarding data are fetched from the API via useRecruitmentProgress hook

export default function CandidateProfilePage() {
  const router = useRouter();
  const { logout, user, acceptAgreement, updateUser } = useAuthStore();

  // Use the candidate profile hook for state management with dirty tracking
  const {
    personalInfo: formData,
    education: educationalBackground,
    workExperience,
    family: familyMembers,
    training: courseTraining,
    assessment: assessmentData,
    updatePersonalInfo,
    updateEducation,
    updateWorkExperience,
    updateFamily,
    updateTraining,
    updateAssessment,
    isLoading: profileLoading,
    isSaving,
    loadError: profileError,
    dirtyState,
    hasUnsavedChanges,
    isSubmitted,
    submitApplication,
    saveDraft,
  } = useCandidateProfile(user?.id);

  // Fetch interview, MCU, and onboarding data from HRIS (read-only)
  const {
    interview: interviewData,
    mcu: mcuData,
    onboarding: onboardingData,
    refetch: refetchProgress,
  } = useRecruitmentProgress(user?.id, isSubmitted);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // No need to clear localStorage - data is now user-specific (per candidateId)
    await logout();
    setShowLogoutDialog(false);
    router.push("/login");
  };

  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [hasConsented, setHasConsented] = React.useState(false);
  const [consentChecked, setConsentChecked] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isAcceptingAgreement, setIsAcceptingAgreement] = React.useState(false);

  // Check if user has already accepted agreement on mount
  React.useEffect(() => {
    if (user?.agreementAcceptedAt) {
      setHasConsented(true);
      setCurrentStep(1);
      setCompletedSteps(new Set([0]));
    }
  }, [user?.agreementAcceptedAt]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSubmitSuccessDialog, setShowSubmitSuccessDialog] = React.useState(false);
  const [isAccepted, setIsAccepted] = React.useState(false);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const formRef = React.useRef<HTMLDivElement>(null);

  // Sync UI state when isSubmitted changes (from hook)
  // Determine the furthest completed section and navigate to the next one
  React.useEffect(() => {
    if (isSubmitted) {
      const completed = new Set([0, 1, 2, 3, 4, 5, 6]);

      // MCU passed + onboarding data available → navigate to Onboarding, mark Interview & MCU complete
      if (mcuData?.status === "PASSED" && onboardingData !== null) {
        completed.add(7);
        completed.add(8);
        setCompletedSteps(completed);
        setCurrentStep(9);
      }
      // Interview all passed + MCU data available → navigate to MCU, mark Interview complete
      else if (interviewData?.allPassed === true && mcuData !== null) {
        completed.add(7);
        setCompletedSteps(completed);
        setCurrentStep(8);
      }
      // Interview started → navigate to Interview
      else if (interviewData !== null && interviewData.interviewStarted) {
        setCompletedSteps(completed);
        setCurrentStep(7);
      }
      // Otherwise stay on Assessment — candidate waits for HR to schedule interview
      else {
        setCompletedSteps(completed);
        setCurrentStep(6);
      }
    }
  }, [isSubmitted, interviewData, mcuData, onboardingData]);

  // Sync isAccepted from onboarding data
  React.useEffect(() => {
    if (onboardingData?.onboardingAcceptedAt) {
      setIsAccepted(true);
    }
  }, [onboardingData]);

  // Sequential step accessibility
  const isStepAccessible = (stepId: number): boolean => {
    if (stepId === 0) return true;
    if (!hasConsented) return false;
    // Steps 1-6: all previous sections must be complete
    if (stepId >= 1 && stepId <= 6) {
      return Array.from({ length: stepId - 1 }, (_, i) => i + 1).every(
        (i) => isSectionComplete(i)
      );
    }
    // Step 7 (Interview): requires submitted application + HR has started interview process
    if (stepId === 7) return isSubmitted && interviewData !== null && interviewData.interviewStarted;
    // Step 8 (MCU): requires both interviews passed + MCU data available
    if (stepId === 8) return isSubmitted && interviewData?.allPassed === true && mcuData !== null;
    // Step 9 (Onboarding): requires MCU passed + onboarding data available
    if (stepId === 9) return isSubmitted && mcuData?.status === "PASSED" && onboardingData !== null;
    return false;
  };

  // Handle assessment field changes
  const handleAssessmentChange = (field: string, value: string) => {
    updateAssessment(field as keyof typeof assessmentData, value);
  };

  // Dialog states
  const [eduDialogOpen, setEduDialogOpen] = React.useState(false);
  const [eduEditIndex, setEduEditIndex] = React.useState<number | null>(null);
  const [eduForm, setEduForm] = React.useState<Omit<EducationalBackground, "id">>({ schoolUniversity: "", city: "", degree: "", major: "", yearGraduate: new Date().getFullYear() });

  const [workDialogOpen, setWorkDialogOpen] = React.useState(false);
  const [workEditIndex, setWorkEditIndex] = React.useState<number | null>(null);
  const [workForm, setWorkForm] = React.useState<Omit<WorkExperience, "id">>({ company: "", city: "", jobTitle: "", period: "", lengthOfWorking: "" });

  const [familyDialogOpen, setFamilyDialogOpen] = React.useState(false);
  const [familyEditIndex, setFamilyEditIndex] = React.useState<number | null>(null);
  const [familyForm, setFamilyForm] = React.useState<Omit<FamilyMember, "id">>({ name: "", relation: "", age: 0, education: "", work: "" });

  const [trainingDialogOpen, setTrainingDialogOpen] = React.useState(false);
  const [trainingEditIndex, setTrainingEditIndex] = React.useState<number | null>(null);
  const [trainingForm, setTrainingForm] = React.useState<Omit<CourseTraining, "id">>({ courseTopic: "", provider: "", year: new Date().getFullYear(), city: "", certificate: "" });

  const handleInputChange = (field: string, value: string | number) => {
    updatePersonalInfo(field as keyof typeof formData, String(value));
  };

  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  // isSaving from hook is used for submit loading state

  // --- Section completion checks ---
  const isPersonalInfoComplete = (): boolean => {
    return !!(
      formData.fullName.trim() &&
      formData.idNumber.trim() &&
      formData.taxIdNumber.trim() &&
      formData.nationality.trim() &&
      formData.bpjsNumber.trim() &&
      formData.religion.trim() &&
      formData.mobilePhone.trim() &&
      formData.address.trim() &&
      formData.personalEmail.trim() &&
      formData.domicileAddress.trim() &&
      formData.birthPlace.trim() &&
      formData.residentialStatus.trim() &&
      formData.birthDate.trim() &&
      formData.uniformShirtSize.trim() &&
      formData.uniformPantsSize.trim()
    );
  };

  const isEducationComplete = (): boolean => educationalBackground.length > 0;
  const isExperienceComplete = (): boolean => workExperience.length > 0;
  const isFamilyComplete = (): boolean => familyMembers.length > 0;
  const isTrainingComplete = (): boolean => courseTraining.length > 0;

  // Check if a section (by step id) is complete
  const isSectionComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 0: return hasConsented;
      case 1: return isPersonalInfoComplete();
      case 2: return isEducationComplete();
      case 3: return isExperienceComplete();
      case 4: return isFamilyComplete();
      case 5: return isTrainingComplete();
      case 6: return true; // Assessment has no required fields
      case 7: return interviewData?.allPassed === true; // Interview complete when all passed
      case 8: return mcuData?.status === "PASSED"; // MCU complete when passed
      default: return false;
    }
  };

  // Get the label of the first incomplete section blocking access (for error messages)
  const SECTION_LABELS: Record<number, string> = {
    1: "Personal Info",
    2: "Education",
    3: "Experience",
    4: "Family",
    5: "Training",
  };

  // Validation for personal info — returns first missing field name
  const validatePersonalInfo = (): string | null => {
    if (!formData.fullName.trim()) return "Full Name is required";
    if (!formData.idNumber.trim()) return "ID Number (KTP) is required";
    if (!formData.taxIdNumber.trim()) return "Tax ID Number (NPWP) is required";
    if (!formData.nationality.trim()) return "Nationality is required";
    if (!formData.bpjsNumber.trim()) return "BPJS Number is required";
    if (!formData.religion.trim()) return "Religion is required";
    if (!formData.mobilePhone.trim()) return "Mobile Phone is required";
    if (!formData.address.trim()) return "Address is required";
    if (!formData.personalEmail.trim()) return "Personal Email is required";
    if (!formData.domicileAddress.trim()) return "Current Address is required";
    if (!formData.birthPlace.trim()) return "Birth Place is required";
    if (!formData.residentialStatus.trim()) return "Residential Status is required";
    if (!formData.birthDate.trim()) return "Birth Date is required";
    if (!formData.uniformShirtSize.trim()) return "Uniform Shirt Size is required";
    if (!formData.uniformPantsSize.trim()) return "Uniform Pants Size is required";
    return null;
  };

  // Get validation error for a section (for detailed toast messages)
  const getSectionValidationError = (stepId: number): string | null => {
    switch (stepId) {
      case 1: return validatePersonalInfo();
      case 2: return educationalBackground.length === 0 ? "Please add at least one education entry" : null;
      case 3: return workExperience.length === 0 ? "Please add at least one work experience entry" : null;
      case 4: return familyMembers.length === 0 ? "Please add at least one family member" : null;
      case 5: return courseTraining.length === 0 ? "Please add at least one training/course entry" : null;
      default: return null;
    }
  };

  const goToStep = (step: number) => {
    if (step < 0 || step >= STEPS.length) return;

    // For steps 1-6, check sequential completion of all prior sections
    if (step >= 1 && step <= 6 && !isStepAccessible(step)) {
      // Find the first incomplete section that blocks access
      const firstIncomplete = Array.from({ length: step }, (_, i) => i + 1).find(
        (i) => i < step && !isSectionComplete(i)
      );

      if (firstIncomplete !== undefined) {
        const sectionLabel = SECTION_LABELS[firstIncomplete] || STEPS[firstIncomplete]?.label;
        const error = getSectionValidationError(firstIncomplete);
        toast.error(error || `Please complete ${sectionLabel} first`, {
          description: `Complete the ${sectionLabel} section before proceeding.`,
        });
        // Navigate to the first incomplete section
        setCurrentStep(firstIncomplete);
        formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (!isStepAccessible(step)) return;

    // No longer save on every navigation - dirty tracking handles this
    // Data is saved only on "Submit Application" at step 6
    if (currentStep <= 5 && !isSubmitted) {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(currentStep);
        return next;
      });
    }
    setCurrentStep(step);
    formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;

    // Only allow submit from Assessment step (step 6)
    if (currentStep !== 6) return;

    // Validate all sections (1-5) before submitting
    const incompleteSection = Array.from({ length: 5 }, (_, i) => i + 1).find(
      (i) => !isSectionComplete(i)
    );
    if (incompleteSection !== undefined) {
      const sectionLabel = SECTION_LABELS[incompleteSection] || STEPS[incompleteSection]?.label;
      const error = getSectionValidationError(incompleteSection);
      toast.error(error || `Please complete ${sectionLabel}`, {
        description: `Complete the ${sectionLabel} section before submitting.`,
      });
      setCurrentStep(incompleteSection);
      formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit all dirty sections using the hook
      const result = await submitApplication();

      if (result.success) {
        updateUser({ name: formData.fullName });
        // isSubmitted is now managed by the hook - UI syncs via useEffect
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          Array.from({ length: 7 }, (_, i) => i).forEach((i) => next.add(i));
          return next;
        });
        setShowSubmitSuccessDialog(true);
      } else {
        // Show errors for failed sections
        result.errors.forEach((error) => toast.error(error));
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = async () => {
    setIsAccepting(true);
    try {
      const result = await candidateProfileService.acceptOnboarding();
      if (result.success) {
        setIsAccepted(true);
        refetchProgress();
        toast.success("Offer accepted successfully! Welcome aboard!");
      } else {
        toast.error(result.message || "Failed to accept offer");
      }
    } catch {
      toast.error("Failed to accept offer. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  // Education handlers
  const openAddEducation = () => {
    setEduForm({ schoolUniversity: "", city: "", degree: "", major: "", yearGraduate: new Date().getFullYear() });
    setEduEditIndex(null);
    setEduDialogOpen(true);
  };
  const openEditEducation = (index: number) => {
    const item = educationalBackground[index];
    setEduForm({ schoolUniversity: item.schoolUniversity, city: item.city, degree: item.degree, major: item.major, yearGraduate: item.yearGraduate });
    setEduEditIndex(index);
    setEduDialogOpen(true);
  };
  const saveEducation = () => {
    if (eduEditIndex !== null) {
      const updated = [...educationalBackground];
      updated[eduEditIndex] = { ...updated[eduEditIndex], ...eduForm };
      updateEducation(updated);
    } else {
      updateEducation([...educationalBackground, { id: crypto.randomUUID(), ...eduForm }]);
    }
    setEduDialogOpen(false);
  };

  // Work Experience handlers
  const openAddWork = () => {
    setWorkForm({ company: "", city: "", jobTitle: "", period: "", lengthOfWorking: "" });
    setWorkEditIndex(null);
    setWorkDialogOpen(true);
  };
  const openEditWork = (index: number) => {
    const item = workExperience[index];
    setWorkForm({ company: item.company, city: item.city, jobTitle: item.jobTitle, period: item.period, lengthOfWorking: item.lengthOfWorking });
    setWorkEditIndex(index);
    setWorkDialogOpen(true);
  };
  const saveWork = () => {
    if (workEditIndex !== null) {
      const updated = [...workExperience];
      updated[workEditIndex] = { ...updated[workEditIndex], ...workForm };
      updateWorkExperience(updated);
    } else {
      updateWorkExperience([...workExperience, { id: crypto.randomUUID(), ...workForm }]);
    }
    setWorkDialogOpen(false);
  };

  // Family handlers
  const openAddFamily = () => {
    setFamilyForm({ name: "", relation: "", age: 0, education: "", work: "" });
    setFamilyEditIndex(null);
    setFamilyDialogOpen(true);
  };
  const openEditFamily = (index: number) => {
    const item = familyMembers[index];
    setFamilyForm({ name: item.name, relation: item.relation, age: item.age, education: item.education, work: item.work });
    setFamilyEditIndex(index);
    setFamilyDialogOpen(true);
  };
  const saveFamily = () => {
    if (familyEditIndex !== null) {
      const updated = [...familyMembers];
      updated[familyEditIndex] = { ...updated[familyEditIndex], ...familyForm };
      updateFamily(updated);
    } else {
      updateFamily([...familyMembers, { id: crypto.randomUUID(), ...familyForm }]);
    }
    setFamilyDialogOpen(false);
  };

  // Training handlers
  const openAddTraining = () => {
    setTrainingForm({ courseTopic: "", provider: "", year: new Date().getFullYear(), city: "", certificate: "" });
    setTrainingEditIndex(null);
    setTrainingDialogOpen(true);
  };
  const openEditTraining = (index: number) => {
    const item = courseTraining[index];
    setTrainingForm({ courseTopic: item.courseTopic, provider: item.provider, year: item.year, city: item.city, certificate: item.certificate });
    setTrainingEditIndex(index);
    setTrainingDialogOpen(true);
  };
  const saveTraining = () => {
    if (trainingEditIndex !== null) {
      const updated = [...courseTraining];
      updated[trainingEditIndex] = { ...updated[trainingEditIndex], ...trainingForm };
      updateTraining(updated);
    } else {
      updateTraining([...courseTraining, { id: crypto.randomUUID(), ...trainingForm }]);
    }
    setTrainingDialogOpen(false);
  };

  const handleConsent = async () => {
    setIsAcceptingAgreement(true);
    try {
      const success = await acceptAgreement();
      if (success) {
        setHasConsented(true);
        setCompletedSteps((prev) => new Set(prev).add(0));
        goToStep(1);
      }
    } finally {
      setIsAcceptingAgreement(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[hsl(220,20%,97%)]">
      {/* Top Header Bar — TUV design */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between bg-white"
        style={{
          height: "75px",
          padding: "0 24px",
          borderBottom: "1px solid #d0d6dd",
        }}
      >
        {/* Left side — logo */}
        <div className="flex items-center" style={{ gap: "16px" }}>
          <Image
            src="/images/tuv-nord-logo.png"
            alt="TÜV NORD"
            width={140}
            height={40}
            priority
            style={{ objectPosition: "left center" }}
          />
        </div>

        {/* Right side — divider + user */}
        <div className="flex items-center" style={{ gap: "16px" }}>
          {/* Divider */}
          <div
            style={{
              width: "1.3px",
              height: "56px",
              backgroundColor: "var(--hsd-ui-color-gray-300)",
            }}
          />

          {/* User Section — avatar + name + dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex cursor-pointer items-center border-0 bg-transparent outline-none" style={{ gap: "8px" }}>
                {/* Avatar */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--hsd-ui-color-blue-200)",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(35, 41, 51, 1)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {user?.name ? getInitials(user.name) : "?"}
                  </span>
                </div>
                {/* Name + Email */}
                <div className="hidden md:flex md:flex-col md:items-start">
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: 400,
                      color: "rgba(35, 41, 51, 1)",
                      lineHeight: 1.4,
                    }}
                  >
                    {user?.name || "-"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 300,
                      color: "rgba(147, 158, 153, 1)",
                      lineHeight: 1.4,
                    }}
                  >
                    {user?.email || ""}
                  </span>
                </div>
                {/* Chevron */}
                <ChevronDown
                  className="hidden md:block"
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "rgba(120, 134, 127, 1)",
                  }}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="min-w-[160px]">
              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                className="cursor-pointer"
              >
                <LogOut
                  className="mr-2"
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "var(--hsd-ui-color-red-600)",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--hsd-ui-color-red-600)",
                  }}
                >
                  Logout
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout Confirmation Dialog */}
          <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmation Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end the session and exit the page?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    backgroundColor: "var(--hsd-ui-color-navy-500)",
                    borderColor: "var(--hsd-ui-color-navy-500)",
                  }}
                >
                  {isLoggingOut ? "Logging out..." : "Yes, Sure"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Hero Section */}
      <div
        className="bg-white"
        style={{ borderBottom: "1px solid rgba(120, 134, 127, 0.2)" }}
      >
        <div className="px-6 py-8 sm:px-8">
          <div className="px-2">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Candidate Application</p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Candidate Data Form</h1>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs font-semibold tabular-nums text-muted-foreground">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Step Navigation Sidebar */}
          <nav className="shrink-0 lg:w-56">
            <div className="sticky top-[5.5rem] space-y-1">
              {STEPS.filter((step) => {
                // Hide Interview until HR has started the process
                if (step.id === 7) return isSubmitted && interviewData !== null;
                // Hide MCU until data exists
                if (step.id === 8) return mcuData !== null;
                // Hide Onboarding until data exists
                if (step.id === 9) return onboardingData !== null;
                return true;
              }).map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.has(step.id) && isSectionComplete(step.id);
                const isLocked = !isStepAccessible(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    disabled={isLocked}
                    className={cn(
                      "group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-all duration-200",
                      isLocked ? "cursor-not-allowed opacity-50" : isActive ? "bg-white" : "hover:bg-white/60"
                    )}
                    style={isActive && !isLocked ? {
                      borderRadius: "8px",
                      border: "1px solid rgba(120, 134, 127, 0.2)",
                    } : { borderRadius: "8px" }}
                  >
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center transition-all duration-200",
                      isLocked ? "bg-muted/60 text-muted-foreground/40" : isActive ? "text-white" : isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )} style={{ borderRadius: "4px", ...(isActive && !isLocked ? { backgroundColor: "#001ed2" } : {}) }}>
                      {isLocked ? <Lock className="h-4 w-4" /> : isCompleted && !isActive ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium truncate transition-colors", isLocked ? "text-muted-foreground/50" : isActive ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                      <p className="text-[11px] text-muted-foreground/70 truncate">{isLocked ? (() => {
                        if (step.id >= 2 && step.id <= 6 && hasConsented) {
                          const blocker = Array.from({ length: step.id }, (_, i) => i + 1).find(i => i < step.id && !isSectionComplete(i));
                          return blocker !== undefined ? `Complete ${SECTION_LABELS[blocker] || STEPS[blocker]?.label} first` : "Awaiting previous step";
                        }
                        return "Awaiting previous step";
                      })() : step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Form Content */}
          <div ref={formRef} className="min-w-0 flex-1">
            <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault(); }}>

              {/* Step 0: Agreement */}
              <div className={cn("transition-all duration-300", currentStep === 0 ? "animate-fade-in" : "hidden")}>
                <SectionCard title="Pernyataan Persetujuan Penggunaan Data Pribadi" subtitle="Silakan baca dan setujui sebelum melanjutkan pengisian data">
                  <div className="space-y-5">
                    <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
                      <p>
                        Dengan ini, saya menyatakan memberikan persetujuan secara sukarela kepada <span className="font-semibold text-foreground">PT TÜV NORD Indonesia</span> untuk
                        mengumpulkan, menyimpan, mengolah, dan menggunakan data pribadi saya yang telah saya isi dalam formulir biodata ini.
                        Saya memahami bahwa data pribadi tersebut akan digunakan untuk:
                      </p>

                      <ul className="ml-1 list-inside list-disc space-y-1.5 text-foreground/90">
                        <li>Keperluan proses seleksi</li>
                        <li>Administrasi</li>
                        <li>Pemenuhan kewajiban hukum yang berlaku terkait hubungan kerja dengan perusahaan</li>
                      </ul>

                      <p>
                        Saya juga memahami bahwa data pribadi saya hanya akan diakses oleh pihak-pihak yang berwenang di
                        PT TÜV NORD Indonesia dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan saya, kecuali
                        jika diwajibkan oleh peraturan perundang-undangan yang berlaku:
                      </p>

                      <ul className="ml-1 list-inside list-disc space-y-1.5 text-foreground/90">
                        <li>Mengakses</li>
                        <li>Memperbaiki, serta</li>
                        <li>Menghapus data pribadi saya, sesuai dengan ketentuan yang diatur dalam Undang-Undang Perlindungan Data Pribadi Republik Indonesia No. 27 Tahun 2022.</li>
                      </ul>
                    </div>

                    {!hasConsented ? (
                      <>
                        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3.5">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={consentChecked}
                              onChange={(e) => setConsentChecked(e.target.checked)}
                              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer"
                              style={{
                                borderRadius: "4px",
                                accentColor: "#001ed2",
                              }}
                            />
                            <span className="text-sm leading-relaxed text-foreground/90">
                              Dengan ini, saya menyatakan memberikan persetujuan atas pengumpulan dan pemrosesan data pribadi saya sesuai dengan syarat dan ketentuan yang telah ditetapkan.
                            </span>
                          </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <Button onClick={() => window.history.back()} className="h-10" style={{ borderRadius: "4px", backgroundColor: "var(--hsd-ui-color-red-600)", color: "#fff" }}>
                            Tidak Setuju
                          </Button>
                          <Button onClick={handleConsent} disabled={!consentChecked || isAcceptingAgreement} className="h-10" style={{ backgroundColor: "var(--hsd-ui-color-navy-500)", borderRadius: "4px" }}>
                            {isAcceptingAgreement ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              "Setuju & Lanjutkan"
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 rounded border border-emerald-200 bg-emerald-50 px-5 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-700">Persetujuan Diberikan</p>
                          <p className="text-xs text-emerald-600/80">Anda telah menyetujui pernyataan penggunaan data pribadi.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>

              <fieldset disabled={isSubmitted} className="contents">
              {/* Step 1: Personal Information */}
              <div className={cn("transition-all duration-300", currentStep === 1 ? "animate-fade-in" : "hidden")}>
                <InfoBanner submitted={isSubmitted} />
                <SectionCard title="Personal Information" subtitle="Your basic details and identity documents">
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    <FormField label="Full Name" required>
                      <Input placeholder="Enter your full name" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} required />
                    </FormField>
                    <FormField label="ID Number (KTP)" required>
                      <Input placeholder="16-digit ID number" value={formData.idNumber} onChange={(e) => handleInputChange("idNumber", e.target.value)} required />
                    </FormField>
                    <FormField label="Tax ID Number (NPWP)" required>
                      <Input placeholder="Tax identification number" value={formData.taxIdNumber} onChange={(e) => handleInputChange("taxIdNumber", e.target.value)} required />
                    </FormField>
                    <FormField label="Nationality" required>
                      <Input placeholder="e.g. Indonesian" value={formData.nationality} onChange={(e) => handleInputChange("nationality", e.target.value)} required />
                    </FormField>
                    <FormField label="BPJS Number" required>
                      <Input placeholder="BPJS insurance number" value={formData.bpjsNumber} onChange={(e) => handleInputChange("bpjsNumber", e.target.value)} required />
                    </FormField>
                    <FormField label="Religion" required>
                      <Input placeholder="Your religion" value={formData.religion} onChange={(e) => handleInputChange("religion", e.target.value)} required />
                    </FormField>
                    <FormField label="Mobile Phone" required>
                      <Input placeholder="+62 xxx xxxx xxxx" value={formData.mobilePhone} onChange={(e) => handleInputChange("mobilePhone", e.target.value)} required />
                    </FormField>
                    <FormField label="Personal Email" required>
                      <Input type="email" placeholder="your.email@example.com" value={formData.personalEmail} readOnly className="bg-muted/50" />
                    </FormField>
                    <FormField label="Driving License">
                      <Select value={formData.drivingLicense} onValueChange={(value) => handleInputChange("drivingLicense", value)} disabled={isSubmitted}>
                        <SelectTrigger><SelectValue placeholder="Select license type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="A">SIM A</SelectItem>
                          <SelectItem value="B1">SIM B1</SelectItem>
                          <SelectItem value="B2">SIM B2</SelectItem>
                          <SelectItem value="C">SIM C</SelectItem>
                          <SelectItem value="D">SIM D</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Address (According to ID)" required className="sm:col-span-2">
                      <Textarea placeholder="Full address as on ID card" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required rows={3} />
                    </FormField>
                    <FormField label="Current Address" required className="sm:col-span-2">
                      <Textarea placeholder="Current residential address" value={formData.domicileAddress} onChange={(e) => handleInputChange("domicileAddress", e.target.value)} required rows={3} />
                    </FormField>
                    <FormField label="Residential Status" required>
                      <Select value={formData.residentialStatus} onValueChange={(value) => handleInputChange("residentialStatus", value)} disabled={isSubmitted}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own">Own House</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="family">Living with Family</SelectItem>
                          <SelectItem value="company">Company Housing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Birth Date" required>
                      <Input type="date" value={formData.birthDate} onChange={(e) => handleInputChange("birthDate", e.target.value)} required />
                    </FormField>
                    <FormField label="Birth Place" required>
                      <Input placeholder="City of birth" value={formData.birthPlace} onChange={(e) => handleInputChange("birthPlace", e.target.value)} required />
                    </FormField>
                    <FormField label="Marital Status">
                      <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange("maritalStatus", value)} disabled={isSubmitted}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Uniform Shirt Size" required>
                      <RadioGroup value={formData.uniformShirtSize} onValueChange={(value) => handleInputChange("uniformShirtSize", value)} className="flex flex-wrap gap-2 pt-1">
                        {["S", "M", "L", "XL", "XXL", "Other"].map((size) => (
                          <div key={size} className="flex items-center">
                            <RadioGroupItem value={size.toLowerCase()} id={`shirt-${size}`} className="peer sr-only" />
                            <Label htmlFor={`shirt-${size}`} className="cursor-pointer rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-accent/40 hover:text-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 peer-data-[state=checked]:text-accent">
                              {size}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormField>
                    <FormField label="Uniform Pants Size" required>
                      <RadioGroup value={formData.uniformPantsSize} onValueChange={(value) => handleInputChange("uniformPantsSize", value)} className="flex flex-wrap gap-2 pt-1">
                        {["28", "29", "30", "31", "32", "33", "34", "35", "36", "Other"].map((size) => (
                          <div key={size} className="flex items-center">
                            <RadioGroupItem value={size.toLowerCase()} id={`pants-${size}`} className="peer sr-only" />
                            <Label htmlFor={`pants-${size}`} className="cursor-pointer rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-accent/40 hover:text-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 peer-data-[state=checked]:text-accent">
                              {size}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormField>
                  </div>
                </SectionCard>
              </div>

              {/* Step 2: Educational Background */}
              <div className={cn("transition-all duration-300", currentStep === 2 ? "animate-fade-in" : "hidden")}>
                <InfoBanner submitted={isSubmitted} />
                <SectionCard
                  title="Educational Background"
                  subtitle="Add your academic qualifications from most recent"
                  action={!isSubmitted ? <Button type="button" onClick={openAddEducation} className="gap-1.5 text-sm" style={{ backgroundColor: "#001ed2", borderRadius: "4px", color: "#fff", height: "38px", padding: "0 16px" }}><Plus className="h-4 w-4" />Add Entry</Button> : undefined}
                >
                  {educationalBackground.length === 0 ? (
                    <EmptyState icon={GraduationCap} title="No education entries yet" description="Add your educational background starting from the most recent qualification." actionLabel="Add Education" onAction={openAddEducation} />
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>School / University</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Degree</TableHead>
                            <TableHead>Major</TableHead>
                            <TableHead className="w-24">Year</TableHead>
                            {!isSubmitted && <TableHead className="w-20 text-center">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {educationalBackground.map((edu, index) => (
                            <TableRow key={edu.id} className="group">
                              <TableCell className="font-medium">{edu.schoolUniversity || "-"}</TableCell>
                              <TableCell>{edu.city || "-"}</TableCell>
                              <TableCell>{edu.degree || "-"}</TableCell>
                              <TableCell>{edu.major || "-"}</TableCell>
                              <TableCell>{edu.yearGraduate}</TableCell>
                              {!isSubmitted && (
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" onClick={() => openEditEducation(index)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <DeleteRowButton onConfirm={() => updateEducation(educationalBackground.filter((item) => item.id !== edu.id))} itemName={edu.schoolUniversity || `Entry #${index + 1}`} />
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Step 3: Work Experience */}
              <div className={cn("transition-all duration-300", currentStep === 3 ? "animate-fade-in" : "hidden")}>
                <InfoBanner submitted={isSubmitted} />
                <SectionCard
                  title="Work Experience"
                  subtitle="List your professional experience from most recent"
                  action={!isSubmitted ? <Button type="button" onClick={openAddWork} className="gap-1.5 text-sm" style={{ backgroundColor: "#001ed2", borderRadius: "4px", color: "#fff", height: "38px", padding: "0 16px" }}><Plus className="h-4 w-4" />Add Entry</Button> : undefined}
                >
                  {workExperience.length === 0 ? (
                    <EmptyState icon={Briefcase} title="No work experience added" description="Add your work experience starting from the most recent position." actionLabel="Add Experience" onAction={openAddWork} />
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Company</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Duration</TableHead>
                            {!isSubmitted && <TableHead className="w-20 text-center">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workExperience.map((work, index) => (
                            <TableRow key={work.id} className="group">

                              <TableCell className="font-medium">{work.company || "-"}</TableCell>
                              <TableCell>{work.city || "-"}</TableCell>
                              <TableCell>{work.jobTitle || "-"}</TableCell>
                              <TableCell>{work.period || "-"}</TableCell>
                              <TableCell>{work.lengthOfWorking || "-"}</TableCell>
                              {!isSubmitted && (
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" onClick={() => openEditWork(index)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <DeleteRowButton onConfirm={() => updateWorkExperience(workExperience.filter((item) => item.id !== work.id))} itemName={work.company || `Entry #${index + 1}`} />
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Step 4: Family Members */}
              <div className={cn("transition-all duration-300", currentStep === 4 ? "animate-fade-in" : "hidden")}>
                <InfoBanner submitted={isSubmitted} />
                <SectionCard
                  title="Family Members"
                  subtitle="List your immediate family members"
                  action={!isSubmitted ? <Button type="button" onClick={openAddFamily} className="gap-1.5 text-sm" style={{ backgroundColor: "#001ed2", borderRadius: "4px", color: "#fff", height: "38px", padding: "0 16px" }}><Plus className="h-4 w-4" />Add Entry</Button> : undefined}
                >
                  {familyMembers.length === 0 ? (
                    <EmptyState icon={Users} title="No family members listed" description="Add your immediate family members including parents, spouse, and children." actionLabel="Add Family Member" onAction={openAddFamily} />
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Name</TableHead>
                            <TableHead>Relation</TableHead>
                            <TableHead className="w-20">Age</TableHead>
                            <TableHead>Education</TableHead>
                            <TableHead>Occupation</TableHead>
                            {!isSubmitted && <TableHead className="w-20 text-center">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {familyMembers.map((member, index) => (
                            <TableRow key={member.id} className="group">

                              <TableCell className="font-medium">{member.name || "-"}</TableCell>
                              <TableCell>{member.relation || "-"}</TableCell>
                              <TableCell>{member.age || "-"}</TableCell>
                              <TableCell>{member.education || "-"}</TableCell>
                              <TableCell>{member.work || "-"}</TableCell>
                              {!isSubmitted && (
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" onClick={() => openEditFamily(index)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <DeleteRowButton onConfirm={() => updateFamily(familyMembers.filter((item) => item.id !== member.id))} itemName={member.name || `Entry #${index + 1}`} />
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Step 5: Course / Training */}
              <div className={cn("transition-all duration-300", currentStep === 5 ? "animate-fade-in" : "hidden")}>
                <InfoBanner submitted={isSubmitted} />
                <SectionCard
                  title="Course / Training Experience"
                  subtitle="List relevant courses, training, and certifications"
                  action={!isSubmitted ? <Button type="button" onClick={openAddTraining} className="gap-1.5 text-sm" style={{ backgroundColor: "#001ed2", borderRadius: "4px", color: "#fff", height: "38px", padding: "0 16px" }}><Plus className="h-4 w-4" />Add Entry</Button> : undefined}
                >
                  {courseTraining.length === 0 ? (
                    <EmptyState icon={Award} title="No training entries yet" description="Add any courses, workshops, or certifications you have completed." actionLabel="Add Training" onAction={openAddTraining} />
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Course Topic</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead className="w-24">Year</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Certificate</TableHead>
                            {!isSubmitted && <TableHead className="w-20 text-center">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courseTraining.map((course, index) => (
                            <TableRow key={course.id} className="group">

                              <TableCell className="font-medium">{course.courseTopic || "-"}</TableCell>
                              <TableCell>{course.provider || "-"}</TableCell>
                              <TableCell>{course.year}</TableCell>
                              <TableCell>{course.city || "-"}</TableCell>
                              <TableCell>{course.certificate || "-"}</TableCell>
                              {!isSubmitted && (
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" onClick={() => openEditTraining(index)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <DeleteRowButton onConfirm={() => updateTraining(courseTraining.filter((item) => item.id !== course.id))} itemName={course.courseTopic || `Entry #${index + 1}`} />
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Step 6: Assessment */}
              <div className={cn("transition-all duration-300 space-y-6", currentStep === 6 ? "animate-fade-in" : "hidden")}>
                <InfoBanner submitted={isSubmitted} />
                <SectionCard title="Job Vacancy" subtitle="Position you are applying for">
                  <div className="rounded-lg bg-accent/5 border border-accent/20 px-4 py-3">
                    <p className="text-sm font-medium text-accent">{user?.jobTitleName || "-"}</p>
                  </div>
                </SectionCard>

                <SectionCard title="Self Assessment" subtitle="Tell us about yourself and your expectations">
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      <FormField label="What caused you to leave your last job?">
                        <Textarea placeholder="Describe your reason..." value={assessmentData.reasonLeavingLastJob} onChange={(e) => handleAssessmentChange("reasonLeavingLastJob", e.target.value)} rows={3} />
                      </FormField>
                      <FormField label="Describe your last job description!">
                        <Textarea placeholder="Describe your responsibilities..." value={assessmentData.lastJobDescription} onChange={(e) => handleAssessmentChange("lastJobDescription", e.target.value)} rows={3} />
                      </FormField>
                      <FormField label="What is your reason/purpose for applying to this company?">
                        <Textarea placeholder="Your motivation..." value={assessmentData.reasonApplying} onChange={(e) => handleAssessmentChange("reasonApplying", e.target.value)} rows={3} />
                      </FormField>
                      <FormField label="What tasks/jobs are you good at, related to the position you are applying for?">
                        <Textarea placeholder="Your relevant skills..." value={assessmentData.relevantSkills} onChange={(e) => handleAssessmentChange("relevantSkills", e.target.value)} rows={3} />
                      </FormField>
                      <FormField label="Last salary received?">
                        <Input className="h-11" placeholder="e.g. Rp 10.000.000" value={assessmentData.lastSalary} onChange={(e) => handleAssessmentChange("lastSalary", e.target.value)} />
                      </FormField>
                      <FormField label="What salary do you expect?">
                        <Input className="h-11" placeholder="e.g. Rp 15.000.000" value={assessmentData.expectedSalary} onChange={(e) => handleAssessmentChange("expectedSalary", e.target.value)} />
                      </FormField>
                      <FormField label="Active language?">
                        <Input className="h-11" placeholder="e.g. Indonesian, English" value={assessmentData.activeLanguage} onChange={(e) => handleAssessmentChange("activeLanguage", e.target.value)} />
                      </FormField>
                      <FormField label="Are you willing to transfer/rotate at work?">
                        <Input className="h-11" placeholder="Yes / No" value={assessmentData.willingToTransfer} onChange={(e) => handleAssessmentChange("willingToTransfer", e.target.value)} />
                      </FormField>
                      <FormField label="Are you willing to do double work for the company due to limited personnel?">
                        <Input className="h-11" placeholder="Yes / No" value={assessmentData.willingToDoubleWork} onChange={(e) => handleAssessmentChange("willingToDoubleWork", e.target.value)} />
                      </FormField>
                      <FormField label="Who are the employees you know at this company?">
                        <Input className="h-11" placeholder="Name of employee" value={assessmentData.knownEmployees} onChange={(e) => handleAssessmentChange("knownEmployees", e.target.value)} />
                      </FormField>
                      <FormField label="When are you ready to work?">
                        <Input className="h-11" placeholder="e.g. Immediately, 1 month notice" value={assessmentData.readyToWork} onChange={(e) => handleAssessmentChange("readyToWork", e.target.value)} />
                      </FormField>
                      <FormField label="What is your relationship with the employee?">
                        <Input className="h-11" placeholder="e.g. Friend, Relative" value={assessmentData.employeeRelationship} onChange={(e) => handleAssessmentChange("employeeRelationship", e.target.value)} />
                      </FormField>
                      <FormField label="Your reference contact name">
                        <Input className="h-11" placeholder="Reference person name" value={assessmentData.referenceContactName} onChange={(e) => handleAssessmentChange("referenceContactName", e.target.value)} />
                      </FormField>
                      <FormField label="Your reference contact phone no">
                        <Input className="h-11" placeholder="+62 xxx xxxx xxxx" value={assessmentData.referenceContactPhone} onChange={(e) => handleAssessmentChange("referenceContactPhone", e.target.value)} />
                      </FormField>
                    </div>
                  </SectionCard>
              </div>

              </fieldset>

              {/* Step 7: Interview - View Only */}
              <div className={cn("transition-all duration-300", currentStep === 7 ? "animate-fade-in" : "hidden")}>
                {interviewData && <SectionCard title="Interview Process" subtitle="Your interview schedule and progress">
                  <div className="space-y-6">

                    {/* Interview Schedule Info */}
                    {(interviewData.interviewDate || interviewData.interviewType) && (
                      <div className="flex flex-wrap items-center gap-4 rounded border border-slate-200 bg-slate-50/80 px-5 py-4">
                        {interviewData.interviewDate && (
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200/70">
                              <CalendarDays className="h-4.5 w-4.5 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Schedule</p>
                              <p className="text-sm font-semibold text-slate-700">
                                {new Date(interviewData.interviewDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                              </p>
                            </div>
                          </div>
                        )}
                        {interviewData.interviewType && (
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200/70">
                              {interviewData.interviewType === "ONLINE" ? <Video className="h-4.5 w-4.5 text-slate-600" /> : <MapPin className="h-4.5 w-4.5 text-slate-600" />}
                            </div>
                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Type</p>
                              <p className="text-sm font-semibold text-slate-700">{interviewData.interviewType === "ONLINE" ? "Online" : "Onsite"}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Overall Status */}
                    <div className={cn(
                      "flex items-center gap-3 rounded border px-5 py-3.5",
                      interviewData.allPassed ? "border-emerald-200 bg-emerald-50" :
                      interviewData.anyFailed ? "border-red-200 bg-red-50" :
                      "border-blue-200 bg-blue-50"
                    )}>
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        interviewData.allPassed ? "bg-emerald-100 text-emerald-600" :
                        interviewData.anyFailed ? "bg-red-100 text-red-600" :
                        "bg-blue-100 text-blue-600"
                      )}>
                        {interviewData.allPassed ? <CheckCircle2 className="h-5 w-5" /> :
                         interviewData.anyFailed ? <XCircle className="h-5 w-5" /> :
                         <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Overall Status</p>
                        <p className={cn(
                          "text-sm font-semibold",
                          interviewData.allPassed ? "text-emerald-700" :
                          interviewData.anyFailed ? "text-red-700" :
                          "text-blue-700"
                        )}>
                          {interviewData.allPassed ? "All Interviews Passed" :
                           interviewData.anyFailed ? "Interview Failed" :
                           "In Progress"}
                        </p>
                      </div>
                    </div>

                    {/* Interview Stage Cards */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { label: "Interview 1", subtitle: "HR Interview", icon: <Shield className="h-5 w-5" />, data: interviewData.interview1 },
                        { label: "Interview 2", subtitle: "User Interview", icon: <UserCheck className="h-5 w-5" />, data: interviewData.interview2 },
                      ].map((stage) => (
                        <div key={stage.label} className={cn(
                          "relative rounded border p-5 transition-all",
                          stage.data.locked ? "border-border/40 bg-muted/20 opacity-50" :
                          stage.data.passed ? "border-emerald-200 bg-emerald-50/40" :
                          stage.data.failed ? "border-red-200 bg-red-50/40" :
                          "border-blue-200 bg-blue-50/40"
                        )}>
                          {stage.data.locked && (
                            <div className="absolute right-3 top-3">
                              <Lock className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                              stage.data.locked ? "bg-muted/40 text-muted-foreground/40" :
                              stage.data.passed ? "bg-emerald-100 text-emerald-600" :
                              stage.data.failed ? "bg-red-100 text-red-600" :
                              "bg-blue-100 text-blue-600"
                            )}>
                              {stage.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold">{stage.label}</p>
                                  <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
                                </div>
                                <Badge variant="outline" className={cn(
                                  "shrink-0 text-xs",
                                  stage.data.locked ? "text-muted-foreground border-border/40" :
                                  stage.data.passed ? "border-emerald-300 text-emerald-700 bg-emerald-50" :
                                  stage.data.failed ? "border-red-300 text-red-700 bg-red-50" :
                                  "border-blue-300 text-blue-700 bg-blue-50"
                                )}>
                                  {stage.data.locked ? "Locked" : stage.data.passed ? "Passed" : stage.data.failed ? "Failed" : "Pending"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Interview schedule and results are managed by HR. Status updates will appear here automatically.
                      </p>
                    </div>
                  </div>
                </SectionCard>}
              </div>

              {/* Step 8: MCU (Medical Check-Up) - View Only */}
              <div className={cn("transition-all duration-300", currentStep === 8 ? "animate-fade-in" : "hidden")}>
                {mcuData && <SectionCard title="Medical Check-Up (MCU)" subtitle="Your MCU status as recorded by HR">
                  <div className="space-y-6">
                    {/* MCU Status Banner */}
                    <div className={cn(
                      "flex items-center gap-4 rounded border px-5 py-4",
                      mcuData.status === "PASSED" ? "border-emerald-200 bg-emerald-50" :
                      mcuData.status === "FAILED" ? "border-red-200 bg-red-50" :
                      "border-amber-200 bg-amber-50"
                    )}>
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                        mcuData.status === "PASSED" ? "bg-emerald-100 text-emerald-600" :
                        mcuData.status === "FAILED" ? "bg-red-100 text-red-600" :
                        "bg-amber-100 text-amber-600"
                      )}>
                        {mcuData.status === "PASSED" ? <CheckCircle2 className="h-6 w-6" /> :
                         mcuData.status === "FAILED" ? <XCircle className="h-6 w-6" /> :
                         <Clock className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">MCU Status</p>
                        <p className={cn(
                          "text-lg font-semibold",
                          mcuData.status === "PASSED" ? "text-emerald-700" :
                          mcuData.status === "FAILED" ? "text-red-700" :
                          "text-amber-700"
                        )}>
                          {mcuData.status === "PASSED" ? "Passed" :
                           mcuData.status === "FAILED" ? "Failed" : "Pending"}
                        </p>
                      </div>
                    </div>

                    {/* MCU Description */}
                    {mcuData.description && (
                      <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                        <p className="text-sm font-medium text-foreground mb-1">Notes</p>
                        <p className="text-sm text-muted-foreground">{mcuData.description}</p>
                      </div>
                    )}

                    {/* MCU Document */}
                    {mcuData.documentName ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">MCU Result Document</p>
                        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                              <FileText className="h-4 w-4" />
                            </div>
                            <p className="truncate text-sm font-medium text-foreground">{mcuData.documentName}</p>
                          </div>
                          {mcuData.documentUrl && (
                            <a href={mcuData.documentUrl} target="_blank" rel="noopener noreferrer" className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent">
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 py-8">
                        <FileText className="h-8 w-8 text-muted-foreground/40" />
                        <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet</p>
                      </div>
                    )}

                    <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        MCU results are managed and recorded by the HR department. Status updates will be reflected here automatically.
                      </p>
                    </div>
                  </div>
                </SectionCard>}
              </div>

              {/* Step 9: Onboarding - View Only */}
              <div className={cn("transition-all duration-300 space-y-6", currentStep === 9 ? "animate-fade-in" : "hidden")}>
                {onboardingData && <><SectionCard title="Onboarding Details" subtitle="Your onboarding information as assigned by HR">
                  <div className="space-y-6">
                    {/* Onboarding Status Banner */}
                    <div className="flex items-center gap-4 rounded border border-emerald-200 bg-emerald-50 px-5 py-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Onboarding Status</p>
                        <p className="text-lg font-semibold text-emerald-700">Confirmed</p>
                      </div>
                    </div>

                    {/* Onboarding Details Grid */}
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      <ReadOnlyField label="Job Placement" value={onboardingData.jobPlacement} icon={MapPin} />
                    </div>
                  </div>
                </SectionCard>

                {/* Facilities Table */}
                <SectionCard title="Facilities" subtitle="Equipment and facilities assigned to you">
                  {onboardingData.facilities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded bg-muted/60">
                        <Package className="h-6 w-6 text-muted-foreground/60" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-foreground">No facilities assigned yet</h3>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">Facilities will be listed here once assigned by the HR team.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-10 text-center">#</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="w-20">Qty</TableHead>
                            <TableHead className="w-20">Unit</TableHead>
                            <TableHead>Inventory No</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {onboardingData.facilities.map((facility) => (
                            <TableRow key={facility.id}>
                              <TableCell className="text-center text-muted-foreground font-medium">{facility.id}</TableCell>
                              <TableCell className="font-medium">{facility.item}</TableCell>
                              <TableCell>{facility.qty}</TableCell>
                              <TableCell>{facility.unit}</TableCell>
                              <TableCell>{facility.inventoryNo}</TableCell>
                              <TableCell>{facility.condition}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">{facility.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </SectionCard>

                {/* Onboarding Program Table */}
                <SectionCard title="Onboarding Program" subtitle="Scheduled onboarding activities and training">
                    {onboardingData.programs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded bg-muted/60">
                          <BookOpen className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-foreground">No programs scheduled yet</h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">Onboarding programs will appear here once scheduled by the HR team.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-6 px-6">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-10 text-center">#</TableHead>
                              <TableHead>Program</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>PIC</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {onboardingData.programs.map((program) => (
                              <TableRow key={program.id}>
                                <TableCell className="text-center text-muted-foreground font-medium">{program.id}</TableCell>
                                <TableCell className="font-medium">{program.program}</TableCell>
                                <TableCell>{program.date}</TableCell>
                                <TableCell>{program.location}</TableCell>
                                <TableCell>{program.pic}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">{program.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </SectionCard>

                <div className="rounded-lg border border-dashed border-border/80 bg-white px-4 py-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All onboarding information is managed by the HR team. Once all details are confirmed, you will receive further instructions.
                  </p>
                </div>

                {/* Confirm & Accept Offer */}
                {!isAccepted && (
                  <div className="rounded border border-accent/20 bg-accent/[0.03] p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded bg-accent/10">
                      <HandshakeIcon className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">Ready to Join?</h3>
                    <p className="mt-2 mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
                      Please review all your onboarding details above. By confirming, you accept the offer and agree to the terms of your employment.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="mt-5 gap-2 px-8" size="lg" disabled={isAccepting} style={{ backgroundColor: "var(--hsd-ui-color-navy-500)", borderRadius: "4px" }}>
                          {isAccepting ? (<><Loader2 className="h-5 w-5 animate-spin" />Accepting...</>) : (<><CheckCircle2 className="h-5 w-5" />Confirm & Accept Offer</>)}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm & Accept Offer</AlertDialogTitle>
                          <AlertDialogDescription>
                            By confirming, you accept the job offer and agree to the onboarding details provided. This action cannot be undone. Are you sure you want to proceed?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isAccepting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleAcceptOffer} disabled={isAccepting}>
                            Yes, I Accept
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {isAccepted && (
                  <div className="flex items-center gap-4 rounded border-2 border-emerald-200 bg-emerald-50 px-6 py-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-emerald-800">Offer Accepted</p>
                      <p className="mt-0.5 text-sm text-emerald-600">You have successfully confirmed and accepted your offer. Welcome aboard!</p>
                    </div>
                  </div>
                )}
                </>}
              </div>

              {/* Navigation Footer */}
              <div className="mt-6 space-y-3">
                {/* Unsaved Changes Indicator */}
                {hasUnsavedChanges && !isSubmitted && currentStep >= 1 && currentStep <= 6 && (
                  <div className="flex items-center justify-between bg-amber-50 px-4 py-2.5" style={{ borderRadius: "8px", border: "1px solid var(--hsd-ui-color-orange-200, #fbd38d)" }}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-sm text-amber-700">You have unsaved changes</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const result = await saveDraft();
                        if (result.success) {
                          toast.success("Draft saved successfully");
                        } else {
                          result.errors.forEach((error) => toast.error(error));
                        }
                      }}
                      disabled={isSaving}
                      className="h-8 border-amber-300 bg-white text-amber-700 hover:bg-amber-100"
                      style={{ borderRadius: "4px" }}
                    >
                      {isSaving ? (<><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving...</>) : (<><Save className="mr-1.5 h-3.5 w-3.5" />Save Draft</>)}
                    </Button>
                  </div>
                )}

                <div
                  className="flex items-center justify-between bg-white p-4"
                  style={{
                    borderRadius: "8px",
                    border: "1px solid rgba(120, 134, 127, 0.2)",
                  }}
                >
                  <Button type="button" variant="ghost" onClick={() => goToStep(currentStep - 1)} disabled={currentStep === 0 || (currentStep > 6 && !isStepAccessible(currentStep - 1))} className="gap-1.5" style={{ borderRadius: "4px" }}>
                    <ChevronLeft className="h-4 w-4" />Previous
                  </Button>
                  <div className="flex items-center gap-1.5">
                    {STEPS.filter((step) => {
                      if (step.id === 7) return isSubmitted && interviewData !== null;
                      if (step.id === 8) return mcuData !== null;
                      if (step.id === 9) return onboardingData !== null;
                      return true;
                    }).map((step) => {
                      const locked = !isStepAccessible(step.id);
                      return (
                        <button key={step.id} type="button" onClick={() => goToStep(step.id)} disabled={locked} className={cn("h-2 rounded-full transition-all duration-300", currentStep === step.id ? "w-6" : (completedSteps.has(step.id) && isSectionComplete(step.id)) ? "w-2 bg-emerald-400" : locked ? "w-2 bg-border/40" : "w-2 bg-border")} style={currentStep === step.id ? { backgroundColor: "#001ed2" } : undefined} />
                      );
                    })}
                  </div>
                  {currentStep === 6 && !isSubmitted ? (
                    <Button key="submit-btn" type="submit" disabled={isSubmitting || isSaving} className="gap-1.5" style={{ backgroundColor: "var(--hsd-ui-color-navy-500)", borderColor: "var(--hsd-ui-color-navy-500)", borderRadius: "4px" }}>
                      {isSubmitting || isSaving ? (<><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>) : (<><Save className="h-4 w-4" />Submit Application</>)}
                    </Button>
                  ) : currentStep < STEPS.length - 1 && isStepAccessible(currentStep + 1) ? (
                    <Button key="next-btn" type="button" onClick={() => goToStep(currentStep + 1)} className="gap-1.5" style={{ backgroundColor: "var(--hsd-ui-color-navy-500)", borderColor: "var(--hsd-ui-color-navy-500)", borderRadius: "4px" }}>
                      Next<ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div key="empty-div" />
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ========== DIALOGS ========== */}

      {/* Submission Success Dialog */}
      <Dialog open={showSubmitSuccessDialog} onOpenChange={(open) => {
        if (!open) {
          setShowSubmitSuccessDialog(false);
          setCurrentStep(7);
          formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}>
        <DialogContent className="sm:max-w-md text-center" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogHeader className="space-y-2 text-center">
              <DialogTitle className="text-xl">Thank You for Your Submission!</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                We have successfully received your application. Our recruitment team will review your information and further details regarding the next steps will be communicated to you shortly.
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => {
                setShowSubmitSuccessDialog(false);
                setCurrentStep(7);
                formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-2 gap-1.5"
              style={{ backgroundColor: "#001ed2", borderRadius: "4px" }}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Education Dialog */}
      <Dialog open={eduDialogOpen} onOpenChange={setEduDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{eduEditIndex !== null ? "Edit Education" : "Add Education"}</DialogTitle>
            <DialogDescription>Fill in your educational background details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <FormField label="School / University" required>
              <Input className="h-11" placeholder="e.g. Universitas Indonesia" value={eduForm.schoolUniversity} onChange={(e) => setEduForm((p) => ({ ...p, schoolUniversity: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="City" required>
                <Input className="h-11" placeholder="City" value={eduForm.city} onChange={(e) => setEduForm((p) => ({ ...p, city: e.target.value }))} />
              </FormField>
              <FormField label="Year Graduated" required>
                <Input className="h-11" type="number" placeholder="2024" value={eduForm.yearGraduate} onChange={(e) => setEduForm((p) => ({ ...p, yearGraduate: parseInt(e.target.value) || 0 }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Degree" required>
                <Select value={eduForm.degree} onValueChange={(value) => setEduForm((p) => ({ ...p, degree: value }))}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select degree" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D1">D1</SelectItem>
                    <SelectItem value="D2">D2</SelectItem>
                    <SelectItem value="D3">D3</SelectItem>
                    <SelectItem value="D4/S1">D4 / S1</SelectItem>
                    <SelectItem value="S2">S2</SelectItem>
                    <SelectItem value="S3">S3</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Major" required>
                <Input className="h-11" placeholder="e.g. Computer Science" value={eduForm.major} onChange={(e) => setEduForm((p) => ({ ...p, major: e.target.value }))} />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEduDialogOpen(false)} style={{ borderRadius: "4px", border: "1px solid rgba(120, 134, 127, 0.3)" }}>Cancel</Button>
            <Button type="button" onClick={saveEducation} style={{ backgroundColor: "#001ed2", borderRadius: "4px" }}>{eduEditIndex !== null ? "Save Changes" : "Add Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Experience Dialog */}
      <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{workEditIndex !== null ? "Edit Work Experience" : "Add Work Experience"}</DialogTitle>
            <DialogDescription>Fill in your professional experience details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <FormField label="Company" required>
              <Input className="h-11" placeholder="Company name" value={workForm.company} onChange={(e) => setWorkForm((p) => ({ ...p, company: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="City" required>
                <Input className="h-11" placeholder="City" value={workForm.city} onChange={(e) => setWorkForm((p) => ({ ...p, city: e.target.value }))} />
              </FormField>
              <FormField label="Job Title" required>
                <Input className="h-11" placeholder="Position held" value={workForm.jobTitle} onChange={(e) => setWorkForm((p) => ({ ...p, jobTitle: e.target.value }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Period" required>
                <Input className="h-11" placeholder="e.g. Jan 2020 - Dec 2023" value={workForm.period} onChange={(e) => setWorkForm((p) => ({ ...p, period: e.target.value }))} />
              </FormField>
              <FormField label="Duration" required>
                <Input className="h-11" placeholder="e.g. 3 years" value={workForm.lengthOfWorking} onChange={(e) => setWorkForm((p) => ({ ...p, lengthOfWorking: e.target.value }))} />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setWorkDialogOpen(false)} style={{ borderRadius: "4px", border: "1px solid rgba(120, 134, 127, 0.3)" }}>Cancel</Button>
            <Button type="button" onClick={saveWork} style={{ backgroundColor: "#001ed2", borderRadius: "4px" }}>{workEditIndex !== null ? "Save Changes" : "Add Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Family Member Dialog */}
      <Dialog open={familyDialogOpen} onOpenChange={setFamilyDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{familyEditIndex !== null ? "Edit Family Member" : "Add Family Member"}</DialogTitle>
            <DialogDescription>Fill in your family member details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <FormField label="Name" required>
              <Input className="h-11" placeholder="Full name" value={familyForm.name} onChange={(e) => setFamilyForm((p) => ({ ...p, name: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Relation" required>
                <Input className="h-11" placeholder="e.g. Father, Mother, Spouse" value={familyForm.relation} onChange={(e) => setFamilyForm((p) => ({ ...p, relation: e.target.value }))} />
              </FormField>
              <FormField label="Age" required>
                <Input className="h-11" type="number" placeholder="Age" value={familyForm.age || ""} onChange={(e) => setFamilyForm((p) => ({ ...p, age: parseInt(e.target.value) || 0 }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Education">
                <Input className="h-11" placeholder="Last education" value={familyForm.education} onChange={(e) => setFamilyForm((p) => ({ ...p, education: e.target.value }))} />
              </FormField>
              <FormField label="Occupation">
                <Input className="h-11" placeholder="Current work" value={familyForm.work} onChange={(e) => setFamilyForm((p) => ({ ...p, work: e.target.value }))} />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFamilyDialogOpen(false)} style={{ borderRadius: "4px", border: "1px solid rgba(120, 134, 127, 0.3)" }}>Cancel</Button>
            <Button type="button" onClick={saveFamily} style={{ backgroundColor: "#001ed2", borderRadius: "4px" }}>{familyEditIndex !== null ? "Save Changes" : "Add Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training Dialog */}
      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{trainingEditIndex !== null ? "Edit Training" : "Add Training"}</DialogTitle>
            <DialogDescription>Fill in your course or training details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <FormField label="Course Topic" required>
              <Input className="h-11" placeholder="Course or training topic" value={trainingForm.courseTopic} onChange={(e) => setTrainingForm((p) => ({ ...p, courseTopic: e.target.value }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="Provider" required>
                <Input className="h-11" placeholder="Training provider" value={trainingForm.provider} onChange={(e) => setTrainingForm((p) => ({ ...p, provider: e.target.value }))} />
              </FormField>
              <FormField label="Year" required>
                <Input className="h-11" type="number" placeholder="Year" value={trainingForm.year} onChange={(e) => setTrainingForm((p) => ({ ...p, year: parseInt(e.target.value) || 0 }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormField label="City">
                <Input className="h-11" placeholder="City" value={trainingForm.city} onChange={(e) => setTrainingForm((p) => ({ ...p, city: e.target.value }))} />
              </FormField>
              <FormField label="Certificate">
                <Input className="h-11" placeholder="Yes / No" value={trainingForm.certificate} onChange={(e) => setTrainingForm((p) => ({ ...p, certificate: e.target.value }))} />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTrainingDialogOpen(false)} style={{ borderRadius: "4px", border: "1px solid rgba(120, 134, 127, 0.3)" }}>Cancel</Button>
            <Button type="button" onClick={saveTraining} style={{ backgroundColor: "#001ed2", borderRadius: "4px" }}>{trainingEditIndex !== null ? "Save Changes" : "Add Entry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}

// --- Sub-components ---

function InfoBanner({ submitted }: { submitted?: boolean }) {
  if (submitted) {
    return (
      <div
        className="mb-4 flex items-center gap-3 px-4 py-3"
        style={{
          borderRadius: "8px",
          border: "1px solid var(--hsd-ui-color-green-200)",
          backgroundColor: "var(--hsd-ui-color-green-50)",
        }}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "var(--hsd-ui-color-green-600)" }} />
        <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--hsd-ui-color-green-700)" }}>
          Your profile has been submitted and is under review. You can view your data but changes are no longer allowed.
        </p>
      </div>
    );
  }
  return (
    <div
      className="mb-4 px-4 py-3"
      style={{
        borderRadius: "8px",
        border: "1px solid var(--hsd-ui-color-navy-200)",
        backgroundColor: "var(--hsd-ui-color-navy-50)",
      }}
    >
      <p className="text-sm leading-relaxed" style={{ color: "var(--hsd-ui-color-navy-500)" }}>
        Please fill in all required information carefully. Your data will be verified by our HR team.
      </p>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <div
      className="bg-white"
      style={{
        borderRadius: "8px",
        border: "1px solid rgba(120, 134, 127, 0.2)",
      }}
    >
      <div
        className="flex items-start justify-between px-6 py-5"
        style={{ borderBottom: "1px solid rgba(120, 134, 127, 0.2)" }}
      >
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function FormField({ label, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium text-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded bg-muted/60">
        <Icon className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button type="button" onClick={onAction} size="sm" variant="outline" className="mt-4 gap-1.5" style={{ borderRadius: "4px" }}>
        <Plus className="h-3.5 w-3.5" />
        {actionLabel}
      </Button>
    </div>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

function ReadOnlyField({ label, value, icon: Icon }: ReadOnlyFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      <div className="flex h-11 items-center bg-muted/30 px-3" style={{ borderRadius: "4px", border: "1px solid rgba(120, 134, 127, 0.2)" }}>
        <span className={cn("text-sm", value ? "text-foreground font-medium" : "text-muted-foreground/60 italic")}>
          {value || "Not yet assigned"}
        </span>
      </div>
    </div>
  );
}

interface DeleteRowButtonProps {
  onConfirm: () => void;
  itemName: string;
}

function DeleteRowButton({ onConfirm, itemName }: DeleteRowButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove &quot;{itemName}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
