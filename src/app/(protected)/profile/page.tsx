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
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { candidateAuthService } from "@/services/candidate-auth.service";
import { toast } from "sonner";
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

// Dummy Interview data (from HRIS) — interview is conducted outside the system
const interviewData = {
  status: "waiting" as "waiting" | "scheduled" | "in_progress" | "passed" | "failed",
};

// Dummy MCU data (from HRIS) — MCU is conducted outside the system
const mcuData = {
  status: "passed" as "pending" | "scheduled" | "passed" | "failed",
  files: [
    { name: "MCU_Result_BloodTest.pdf", size: "1.2 MB", uploadedAt: "2026-03-04" },
    { name: "MCU_Result_GeneralCheckup.pdf", size: "842 KB", uploadedAt: "2026-03-04" },
    { name: "MCU_Result_ChestXRay.pdf", size: "3.5 MB", uploadedAt: "2026-03-05" },
  ] as { name: string; size: string; uploadedAt: string }[],
};

// Dummy Onboarding data (from HRIS)
const onboardingData = {
  employeeId: "EMP-2026-0412",
  department: "Engineering",
  jobTitle: "Software Engineer",
  jobLevel: "Senior",
  superior: "David Park - Engineering Manager",
  joinDate: "2026-04-01",
  jobPlacement: "Head Office - Jakarta",
};

// Dummy Facilities data (from HRIS)
const facilitiesData: { items: string; qty: number; unit: string; inventoryNo: string; condition: string; status: string }[] = [
  { items: "Laptop (ThinkPad X1 Carbon)", qty: 1, unit: "pcs", inventoryNo: "IT-2026-0891", condition: "New", status: "Assigned" },
  { items: "ID Card & Access Badge", qty: 1, unit: "pcs", inventoryNo: "SEC-2026-0412", condition: "New", status: "Assigned" },
  { items: "Office Desk Set (Monitor + Keyboard)", qty: 1, unit: "set", inventoryNo: "GA-2026-1553", condition: "New", status: "Prepared" },
];

// Dummy Onboarding Program data (from HRIS)
const onboardingProgramData: { program: string; date: string; location: string; pic: string; status: string }[] = [
  { program: "Company Orientation & Culture", date: "2026-04-01", location: "Training Room A", pic: "HR Team", status: "Scheduled" },
  { program: "IT Systems & Tools Setup", date: "2026-04-01", location: "IT Helpdesk", pic: "IT Support", status: "Scheduled" },
  { program: "Department Introduction", date: "2026-04-02", location: "Engineering Floor", pic: "David Park", status: "Scheduled" },
  { program: "Safety & Compliance Training", date: "2026-04-03", location: "Online (LMS)", pic: "Compliance Team", status: "Pending" },
];

export default function CandidateProfilePage() {
  const router = useRouter();
  const { logout, user, acceptAgreement, updateUser } = useAuthStore();

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
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isAccepted, setIsAccepted] = React.useState(false);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const formRef = React.useRef<HTMLDivElement>(null);

  // Step accessibility: step 0 always open, steps 1-6 require consent, steps 7-9 locked based on progression
  // TODO: Re-enable lock logic for steps 7-9 when ready for production
  const isStepAccessible = (stepId: number): boolean => {
    if (stepId === 0) return true;
    if (stepId >= 1 && stepId <= 6) return hasConsented;
    // Steps 7-9: temporarily unlocked for design review
    return hasConsented;
  };

  const [formData, setFormData] = React.useState({
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
  });

  const [profileLoading, setProfileLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  const fetchProfile = React.useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await candidateAuthService.getProfile();
      if (response.success && response.data) {
        const c = response.data;
        setFormData({
          fullName: c.fullname,
          idNumber: c.idNo,
          taxIdNumber: c.taxId,
          nationality: c.citizenship,
          bpjsNumber: c.bpjsId,
          religion: c.religion,
          mobilePhone: c.mobilePhone,
          address: c.address,
          personalEmail: c.email,
          domicileAddress: c.domicileAddress || "",
          drivingLicense: c.drivingLicense || "",
          birthPlace: c.birthPlace,
          residentialStatus: c.residentStatus?.toLowerCase() || "",
          birthDate: c.birthDate || "",
          uniformShirtSize: c.uniformShirtSize?.toLowerCase() || "",
          maritalStatus: c.marritalStatus?.toLowerCase() || "",
          uniformPantsSize: c.uniformPantsSize?.toLowerCase() || "",
        });
      } else {
        setProfileError(response.message || "Failed to load profile");
      }
    } catch {
      setProfileError("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const [educationalBackground, setEducationalBackground] = React.useState<EducationalBackground[]>([]);
  const [workExperience, setWorkExperience] = React.useState<WorkExperience[]>([]);
  const [familyMembers, setFamilyMembers] = React.useState<FamilyMember[]>([]);
  const [courseTraining, setCourseTraining] = React.useState<CourseTraining[]>([]);

  // Assessment State
  const [assessmentData, setAssessmentData] = React.useState({
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
  });

  const handleAssessmentChange = (field: string, value: string) => {
    setAssessmentData((prev) => ({ ...prev, [field]: value }));
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  const [isSavingStep, setIsSavingStep] = React.useState(false);

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

  const savePersonalInfo = async (): Promise<boolean> => {
    const validationError = validatePersonalInfo();
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    setIsSavingStep(true);
    try {
      const response = await candidateAuthService.updatePersonalInfo(formData);
      if (response.success) {
        toast.success("Personal information saved");
        updateUser({ name: formData.fullName });
        return true;
      }
      toast.error(response.message || "Failed to save personal information");
      return false;
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setIsSavingStep(false);
    }
  };

  const goToStep = async (step: number) => {
    if (step >= 0 && step < STEPS.length && isStepAccessible(step)) {
      // Save personal info when leaving step 1
      if (currentStep === 1 && step !== 1 && !isSubmitted) {
        const saved = await savePersonalInfo();
        if (!saved) return;
      }

      if (currentStep <= 5 && !isSubmitted) {
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.add(currentStep);
          return next;
        });
      }
      setCurrentStep(step);
      formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;
    setIsSubmitting(true);

    try {
      const response = await candidateAuthService.updatePersonalInfo(formData);

      if (response.success) {
        toast.success("Personal information saved successfully");
        updateUser({ name: formData.fullName });
        setIsSubmitted(true);
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          for (let i = 0; i <= 6; i++) next.add(i);
          return next;
        });
        setCurrentStep(7);
        formRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(response.message || "Failed to save personal information");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = () => {
    setIsAccepted(true);
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
      setEducationalBackground((prev) => {
        const updated = [...prev];
        updated[eduEditIndex] = { ...updated[eduEditIndex], ...eduForm };
        return updated;
      });
    } else {
      setEducationalBackground((prev) => [...prev, { id: crypto.randomUUID(), ...eduForm }]);
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
      setWorkExperience((prev) => {
        const updated = [...prev];
        updated[workEditIndex] = { ...updated[workEditIndex], ...workForm };
        return updated;
      });
    } else {
      setWorkExperience((prev) => [...prev, { id: crypto.randomUUID(), ...workForm }]);
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
      setFamilyMembers((prev) => {
        const updated = [...prev];
        updated[familyEditIndex] = { ...updated[familyEditIndex], ...familyForm };
        return updated;
      });
    } else {
      setFamilyMembers((prev) => [...prev, { id: crypto.randomUUID(), ...familyForm }]);
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
      setCourseTraining((prev) => {
        const updated = [...prev];
        updated[trainingEditIndex] = { ...updated[trainingEditIndex], ...trainingForm };
        return updated;
      });
    } else {
      setCourseTraining((prev) => [...prev, { id: crypto.randomUUID(), ...trainingForm }]);
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
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Image
              src="/images/tuv-nord-logo.png"
              alt="TUV Nord"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 shadow-sm">
                <span className="text-[11px] font-semibold text-white">{user?.name ? getInitials(user.name) : "?"}</span>
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-medium text-muted-foreground">{user?.name || "-"}</span>
                <span className="text-xs text-muted-foreground/70">{user?.email || ""}</span>
              </div>
              <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out from your account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/[0.03]" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-accent/[0.04]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 0.5px, transparent 0)`,
              backgroundSize: "24px 24px",
              opacity: 0.4,
            }}
          />
        </div>
        <div className="relative px-6 py-8 sm:px-8">
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
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.has(step.id);
                const isLocked = !isStepAccessible(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    disabled={isLocked}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200",
                      isLocked ? "cursor-not-allowed opacity-50" : isActive ? "bg-white shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.04]" : "hover:bg-white/60"
                    )}
                  >
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                      isLocked ? "bg-muted/60 text-muted-foreground/40" : isActive ? "bg-accent text-white shadow-sm shadow-accent/30" : isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )}>
                      {isLocked ? <Lock className="h-4 w-4" /> : isCompleted && !isActive ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium truncate transition-colors", isLocked ? "text-muted-foreground/50" : isActive ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                      <p className="text-[11px] text-muted-foreground/70 truncate">{isLocked ? "Awaiting previous step" : step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Form Content */}
          <div ref={formRef} className="min-w-0 flex-1">
            <form onSubmit={handleSubmit}>

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
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-accent focus:ring-accent"
                            />
                            <span className="text-sm leading-relaxed text-foreground/90">
                              Dengan ini, saya menyatakan memberikan persetujuan atas pengumpulan dan pemrosesan data pribadi saya sesuai dengan syarat dan ketentuan yang telah ditetapkan.
                            </span>
                          </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <Button variant="destructive" onClick={() => window.history.back()} className="h-10">
                            Tidak Setuju
                          </Button>
                          <Button onClick={handleConsent} disabled={!consentChecked || isAcceptingAgreement} className="h-10">
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
                      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
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
                      <Select value={formData.drivingLicense} onValueChange={(value) => handleInputChange("drivingLicense", value)}>
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
                      <Select value={formData.residentialStatus} onValueChange={(value) => handleInputChange("residentialStatus", value)}>
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
                      <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange("maritalStatus", value)}>
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
                  action={!isSubmitted ? <Button type="button" onClick={openAddEducation} size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add Entry</Button> : undefined}
                >
                  {educationalBackground.length === 0 ? (
                    <EmptyState icon={GraduationCap} title="No education entries yet" description="Add your educational background starting from the most recent qualification." actionLabel="Add Education" onAction={openAddEducation} />
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-10 text-center">#</TableHead>
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
                              <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
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
                                    <DeleteRowButton onConfirm={() => setEducationalBackground((prev) => prev.filter((item) => item.id !== edu.id))} itemName={edu.schoolUniversity || `Entry #${index + 1}`} />
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
                  action={!isSubmitted ? <Button type="button" onClick={openAddWork} size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add Entry</Button> : undefined}
                >
                  {workExperience.length === 0 ? (
                    <EmptyState icon={Briefcase} title="No work experience added" description="Add your work experience starting from the most recent position." actionLabel="Add Experience" onAction={openAddWork} />
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-10 text-center">#</TableHead>
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
                              <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
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
                                    <DeleteRowButton onConfirm={() => setWorkExperience((prev) => prev.filter((item) => item.id !== work.id))} itemName={work.company || `Entry #${index + 1}`} />
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
                  action={!isSubmitted ? <Button type="button" onClick={openAddFamily} size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add Entry</Button> : undefined}
                >
                  {familyMembers.length === 0 ? (
                    <EmptyState icon={Users} title="No family members listed" description="Add your immediate family members including parents, spouse, and children." actionLabel="Add Family Member" onAction={openAddFamily} />
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-10 text-center">#</TableHead>
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
                              <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
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
                                    <DeleteRowButton onConfirm={() => setFamilyMembers((prev) => prev.filter((item) => item.id !== member.id))} itemName={member.name || `Entry #${index + 1}`} />
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
                  action={!isSubmitted ? <Button type="button" onClick={openAddTraining} size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add Entry</Button> : undefined}
                >
                  {courseTraining.length === 0 ? (
                    <EmptyState icon={Award} title="No training entries yet" description="Add any courses, workshops, or certifications you have completed." actionLabel="Add Training" onAction={openAddTraining} />
                  ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-10 text-center">#</TableHead>
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
                              <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
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
                                    <DeleteRowButton onConfirm={() => setCourseTraining((prev) => prev.filter((item) => item.id !== course.id))} itemName={course.courseTopic || `Entry #${index + 1}`} />
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
              <div className={cn("transition-all duration-300", currentStep === 6 ? "animate-fade-in" : "hidden")}>
                <InfoBanner submitted={isSubmitted} />
                <SectionCard title="Job Vacancy" subtitle="Position you are applying for">
                  <div className="rounded-lg bg-accent/5 border border-accent/20 px-4 py-3">
                    <p className="text-sm font-medium text-accent">IT & Digital Transformation Officer</p>
                  </div>
                </SectionCard>

                <div className="mt-6">
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
              </div>

              </fieldset>

              {/* Step 7: Interview - View Only */}
              <div className={cn("transition-all duration-300", currentStep === 7 ? "animate-fade-in" : "hidden")}>
                <SectionCard title="Interview Process" subtitle="Your interview status as managed by HR">
                  <div className="space-y-6">
                    {/* Interview Status Banner */}
                    <div className={cn(
                      "flex items-center gap-4 rounded-xl border px-5 py-4",
                      interviewData.status === "passed" ? "border-emerald-200 bg-emerald-50" :
                      interviewData.status === "failed" ? "border-red-200 bg-red-50" :
                      interviewData.status === "scheduled" ? "border-blue-200 bg-blue-50" :
                      interviewData.status === "in_progress" ? "border-violet-200 bg-violet-50" :
                      "border-amber-200 bg-amber-50"
                    )}>
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        interviewData.status === "passed" ? "bg-emerald-100 text-emerald-600" :
                        interviewData.status === "failed" ? "bg-red-100 text-red-600" :
                        interviewData.status === "scheduled" ? "bg-blue-100 text-blue-600" :
                        interviewData.status === "in_progress" ? "bg-violet-100 text-violet-600" :
                        "bg-amber-100 text-amber-600"
                      )}>
                        {interviewData.status === "passed" ? <CheckCircle2 className="h-6 w-6" /> :
                         interviewData.status === "failed" ? <XCircle className="h-6 w-6" /> :
                         interviewData.status === "scheduled" ? <CalendarDays className="h-6 w-6" /> :
                         interviewData.status === "in_progress" ? <Video className="h-6 w-6" /> :
                         <Clock className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Interview Status</p>
                        <p className={cn(
                          "text-lg font-semibold capitalize",
                          interviewData.status === "passed" ? "text-emerald-700" :
                          interviewData.status === "failed" ? "text-red-700" :
                          interviewData.status === "scheduled" ? "text-blue-700" :
                          interviewData.status === "in_progress" ? "text-violet-700" :
                          "text-amber-700"
                        )}>
                          {interviewData.status === "waiting" ? "Waiting for Schedule" :
                           interviewData.status === "scheduled" ? "Scheduled" :
                           interviewData.status === "in_progress" ? "In Progress" :
                           interviewData.status === "passed" ? "Passed" : "Failed"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Interview results are managed and recorded by the HR department. Status updates will be reflected here automatically.
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Step 8: MCU (Medical Check-Up) - View Only */}
              <div className={cn("transition-all duration-300", currentStep === 8 ? "animate-fade-in" : "hidden")}>
                <SectionCard title="Medical Check-Up (MCU)" subtitle="Your MCU status as recorded by HR">
                  <div className="space-y-6">
                    {/* MCU Status Banner */}
                    <div className={cn(
                      "flex items-center gap-4 rounded-xl border px-5 py-4",
                      mcuData.status === "passed" ? "border-emerald-200 bg-emerald-50" :
                      mcuData.status === "failed" ? "border-red-200 bg-red-50" :
                      mcuData.status === "scheduled" ? "border-blue-200 bg-blue-50" :
                      "border-amber-200 bg-amber-50"
                    )}>
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        mcuData.status === "passed" ? "bg-emerald-100 text-emerald-600" :
                        mcuData.status === "failed" ? "bg-red-100 text-red-600" :
                        mcuData.status === "scheduled" ? "bg-blue-100 text-blue-600" :
                        "bg-amber-100 text-amber-600"
                      )}>
                        {mcuData.status === "passed" ? <CheckCircle2 className="h-6 w-6" /> :
                         mcuData.status === "failed" ? <XCircle className="h-6 w-6" /> :
                         mcuData.status === "scheduled" ? <CalendarDays className="h-6 w-6" /> :
                         <Clock className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">MCU Status</p>
                        <p className={cn(
                          "text-lg font-semibold capitalize",
                          mcuData.status === "passed" ? "text-emerald-700" :
                          mcuData.status === "failed" ? "text-red-700" :
                          mcuData.status === "scheduled" ? "text-blue-700" :
                          "text-amber-700"
                        )}>
                          {mcuData.status === "pending" ? "Pending" :
                           mcuData.status === "scheduled" ? "Scheduled" :
                           mcuData.status === "passed" ? "Passed" : "Failed"}
                        </p>
                      </div>
                    </div>

                    {/* MCU Result Files */}
                    {mcuData.files.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">MCU Result Documents</p>
                        <div className="space-y-2">
                          {mcuData.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                                  <FileText className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">{file.size} &middot; Uploaded {file.uploadedAt}</p>
                                </div>
                              </div>
                              <button type="button" className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent">
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mcuData.files.length === 0 && (
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
                </SectionCard>
              </div>

              {/* Step 9: Onboarding - View Only */}
              <div className={cn("transition-all duration-300", currentStep === 9 ? "animate-fade-in" : "hidden")}>
                <SectionCard title="Onboarding Details" subtitle="Your onboarding information as assigned by HR">
                  <div className="space-y-6">
                    {/* Onboarding Status Banner */}
                    {onboardingData.employeeId ? (
                      <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Onboarding Status</p>
                          <p className="text-lg font-semibold text-emerald-700">Confirmed</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Onboarding Status</p>
                          <p className="text-lg font-semibold text-amber-700">Awaiting Assignment</p>
                        </div>
                      </div>
                    )}

                    {/* Onboarding Details Grid */}
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      <ReadOnlyField label="Employee ID" value={onboardingData.employeeId} icon={Shield} />
                      <ReadOnlyField label="Department" value={onboardingData.department} icon={Building2} />
                      <ReadOnlyField label="Job Title" value={onboardingData.jobTitle} icon={Briefcase} />
                      <ReadOnlyField label="Job Level" value={onboardingData.jobLevel} icon={Award} />
                      <ReadOnlyField label="Superior" value={onboardingData.superior} icon={UserCheck} />
                      <ReadOnlyField label="Join Date" value={onboardingData.joinDate} icon={CalendarDays} />
                      <ReadOnlyField label="Job Placement" value={onboardingData.jobPlacement} icon={MapPin} />
                    </div>
                  </div>
                </SectionCard>

                {/* Facilities Table */}
                <div className="mt-6">
                  <SectionCard title="Facilities" subtitle="Equipment and facilities assigned to you">
                    {facilitiesData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
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
                            {facilitiesData.map((facility, index) => (
                              <TableRow key={index}>
                                <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
                                <TableCell className="font-medium">{facility.items}</TableCell>
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
                </div>

                {/* Onboarding Program Table */}
                <div className="mt-6">
                  <SectionCard title="Onboarding Program" subtitle="Scheduled onboarding activities and training">
                    {onboardingProgramData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
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
                            {onboardingProgramData.map((program, index) => (
                              <TableRow key={index}>
                                <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
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
                </div>

                <div className="mt-6 rounded-lg border border-dashed border-border/80 bg-white px-4 py-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All onboarding information is managed by the HR team. Once all details are confirmed, you will receive further instructions.
                  </p>
                </div>

                {/* Confirm & Accept Offer */}
                {onboardingData.employeeId && !isAccepted && (
                  <div className="mt-6">
                    <div className="rounded-xl border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-accent/[0.02] p-6 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                        <HandshakeIcon className="h-7 w-7 text-accent" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-foreground">Ready to Join?</h3>
                      <p className="mt-2 mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
                        Please review all your onboarding details above. By confirming, you accept the offer and agree to the terms of your employment.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="mt-5 gap-2 px-8" size="lg">
                            <CheckCircle2 className="h-5 w-5" />
                            Confirm & Accept Offer
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
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleAcceptOffer}>
                              Yes, I Accept
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}

                {isAccepted && (
                  <div className="mt-6">
                    <div className="flex items-center gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-6 py-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-emerald-800">Offer Accepted</p>
                        <p className="mt-0.5 text-sm text-emerald-600">You have successfully confirmed and accepted your offer. Welcome aboard!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm shadow-black/[0.03] ring-1 ring-black/[0.04]">
                <Button type="button" variant="ghost" onClick={() => goToStep(currentStep - 1)} disabled={currentStep === 0 || (currentStep > 6 && !isStepAccessible(currentStep - 1))} className="gap-1.5">
                  <ChevronLeft className="h-4 w-4" />Previous
                </Button>
                <div className="flex items-center gap-1.5">
                  {STEPS.map((step) => {
                    const locked = !isStepAccessible(step.id);
                    return (
                      <button key={step.id} type="button" onClick={() => goToStep(step.id)} disabled={locked} className={cn("h-2 rounded-full transition-all duration-300", currentStep === step.id ? "w-6 bg-accent" : completedSteps.has(step.id) ? "w-2 bg-emerald-400" : locked ? "w-2 bg-border/40" : "w-2 bg-border")} />
                    );
                  })}
                </div>
                {currentStep === 6 && !isSubmitted ? (
                  <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                    {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="h-4 w-4" />Save & Submit</>)}
                  </Button>
                ) : currentStep < STEPS.length - 1 && isStepAccessible(currentStep + 1) ? (
                  <Button type="button" onClick={() => goToStep(currentStep + 1)} disabled={isSavingStep} className="gap-1.5">
                    {isSavingStep ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving...</>) : (<>Next<ChevronRight className="h-4 w-4" /></>)}
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ========== DIALOGS ========== */}

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
            <Button type="button" variant="outline" onClick={() => setEduDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveEducation}>{eduEditIndex !== null ? "Save Changes" : "Add Entry"}</Button>
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
            <Button type="button" variant="outline" onClick={() => setWorkDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveWork}>{workEditIndex !== null ? "Save Changes" : "Add Entry"}</Button>
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
            <Button type="button" variant="outline" onClick={() => setFamilyDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveFamily}>{familyEditIndex !== null ? "Save Changes" : "Add Entry"}</Button>
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
            <Button type="button" variant="outline" onClick={() => setTrainingDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveTraining}>{trainingEditIndex !== null ? "Save Changes" : "Add Entry"}</Button>
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
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        <p className="text-sm text-emerald-700 leading-relaxed font-medium">
          Your profile has been submitted and is under review. You can view your data but changes are no longer allowed.
        </p>
      </div>
    );
  }
  return (
    <div className="mb-4 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
      <p className="text-sm text-muted-foreground leading-relaxed">
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
    <div className="rounded-xl bg-white shadow-sm shadow-black/[0.03] ring-1 ring-black/[0.04]">
      <div className="flex items-start justify-between border-b border-border/60 px-6 py-5">
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
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
        <Icon className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button type="button" onClick={onAction} size="sm" variant="outline" className="mt-4 gap-1.5">
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
      <div className="flex h-11 items-center rounded-lg border border-border/60 bg-muted/30 px-3">
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
