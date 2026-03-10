// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "hr" | "manager" | "employee" | "candidate";
  avatar?: string;
  employeeId?: string;
  candidateCode?: string | null;
  agreementAcceptedAt?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
    expiresIn: number;
  };
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Employee Types
export type EmployeeStatus =
  | "active"
  | "inactive"
  | "on_leave"
  | "terminated"
  | "permanent"
  | "contract"
  | "probation"
  | "outsource"
  | "exit";

export type EmployeeGender = "male" | "female";

export type MaritalStatus = "single" | "married" | "divorced" | "widowed";

export interface Employee {
  id: string;
  employeeId: string;
  employeeNik?: string | null;
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  phone: string;
  employeeContact?: string | null;
  dateOfBirth: string;
  gender: EmployeeGender;
  address: string;
  hireDate: string;
  status: EmployeeStatus;
  departmentId: string;
  divisionId: string;
  jobTitleId: string;
  jobLevelId: string;
  managerId?: string;
  superiorId?: string;
  photo?: string;
  employeeType?: string;
  businessUnit?: string;
  extension?: string;
  location?: string;
  fte?: number;
  permanentDate?: string;
  contractDate?: string;
  contractEndDate?: string;
  probationDate?: string;
  probationEndDate?: string;
  motherName?: string;
  fatherName?: string;
  spouseName?: string;
  maritalStatus?: MaritalStatus;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  exitReason?: string;
  exitDate?: string;
  religion?: string;
  ethnicity?: string;
  certificate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithRelations extends Employee {
  department?: Department;
  division?: Division;
  jobTitle?: JobTitle;
  jobLevel?: JobLevel;
  manager?: Employee;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  cluster: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Division {
  id: string;
  name: string;
  code: string;
  description?: string;
  headId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  category: "Profit Center" | "Non Profit Center";
  description?: string;
  obsId: string;
  divisionId?: string;
  headId?: string;
  obs?: Organization;
  division?: Division;
  createdAt: string;
  updatedAt: string;
}

export interface JobLevel {
  id: string;
  name: string;
  category: string;
  description?: string;
  order?: number;
  canCreateJobTitle: boolean;
  canCreateKpi: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentJobTitle {
  department: {
    id: number;
    name: string;
    code: string;
    obs?: {
      id: number;
      name: string;
      cluster: string | null;
    };
  };
}

export interface JobTitle {
  id: string;
  name: string;
  code?: string;
  description?: string;
  purpose?: string;
  requirement?: string;
  jobLevelId: string;
  divisionId?: number;
  directReportId?: string;
  type?: "Administration" | "Technical";
  jobLevel?: JobLevel;
  division?: { id: number; name: string; code: string | null };
  directReport?: { id: string; name: string; jobLevel: JobLevel } | null;
  departments?: DepartmentJobTitle[];
  departmentId?: string;
  department?: Department;
  responsibilities?: unknown;
  requirements?: unknown;
  createdAt: string;
  updatedAt: string;
}

// Recruitment Types
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  departmentId: string;
  jobTitleId: string;
  jobLevelId: string;
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  locationType: "onsite" | "remote" | "hybrid";
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  status: "draft" | "open" | "closed" | "on_hold";
  openDate?: string;
  closeDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary?: number;
  noticePeriod?: string;
  source: "linkedin" | "job_portal" | "referral" | "website" | "other";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  candidateId: string;
  jobPostingId: string;
  status: "applied" | "screening" | "interview" | "assessment" | "offer" | "hired" | "rejected";
  appliedDate: string;
  stage: number;
  rating?: number;
  notes?: string;
  interviews?: Interview[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationWithRelations extends Application {
  candidate?: Candidate;
  jobPosting?: JobPosting;
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewerId: string;
  scheduledDate: string;
  duration: number;
  type: "phone" | "video" | "onsite" | "technical";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  feedback?: string;
  rating?: number;
  notes?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  openPositions: number;
  pendingApplications: number;
  departmentCount: number;
  avgTenure: number;
  turnoverRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Common Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface FilterState {
  search: string;
  status?: string;
  department?: string;
  division?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Employee Budget Types
export interface EmployeeBudget {
  id: string;
  departmentId: string;
  department?: Department;
  year: number;
  technical: number;
  admin: number;
  document?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeBudgetSummary {
  departmentId: string;
  departmentName: string;
  year: number;
  previousYear: {
    technical: number;
    admin: number;
    total: number;
  };
  currentEmployees: {
    technical: {
      male: number;
      female: number;
      total: number;
    };
    admin: {
      male: number;
      female: number;
      total: number;
    };
    total: number;
  };
  approvedBudget: {
    technical: number;
    admin: number;
    total: number;
  };
  restBudget: {
    technical: number;
    admin: number;
    total: number;
  };
  growth: {
    technical: number;
    admin: number;
    total: number;
  };
}

export interface BudgetCalculation {
  rows: {
    type: "admin" | "technical";
    label: string;
    male: number;
    female: number;
    total: number;
  }[];
  totalCurrent: number;
  totalBudget: number;
  restBudget: number;
}

// Candidate Profile Types
export type DrivingLicense = "A" | "B1" | "B2" | "C" | "D" | "none";
export type ResidentialStatus = "own" | "rent" | "family" | "company" | "other";
export type ShirtSize = "S" | "M" | "L" | "XL" | "XXL" | "other";
export type PantsSize = "28" | "29" | "30" | "31" | "32" | "33" | "34" | "35" | "36" | "other";

export interface CandidateProfile {
  id: string;
  applicationNumber: string;

  // Personal Information
  fullName: string;
  idNumber: string;
  taxIdNumber: string;
  nationality: string;
  bpjsNumber: string;
  religion: string;
  mobilePhone: string;
  address: string;
  personalEmail: string;
  domicileAddress: string;
  drivingLicense?: DrivingLicense;
  birthPlace: string;
  residentialStatus: ResidentialStatus;
  birthDate: string;
  uniformShirtSize: ShirtSize;
  maritalStatus: MaritalStatus;
  uniformPantsSize: PantsSize;

  // Related Data
  educationalBackground: EducationalBackground[];
  workExperience: WorkExperience[];
  familyMembers: FamilyMember[];
  courseTraining: CourseTraining[];

  createdAt: string;
  updatedAt: string;
}

export interface EducationalBackground {
  id: string;
  schoolUniversity: string;
  city: string;
  degree: string;
  major: string;
  yearGraduate: number;
}

export interface WorkExperience {
  id: string;
  company: string;
  city: string;
  jobTitle: string;
  period: string;
  lengthOfWorking: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  education: string;
  work: string;
}

export interface CourseTraining {
  id: string;
  courseTopic: string;
  provider: string;
  year: number;
  city: string;
  certificate: string;
}

export interface CandidateAssessment {
  id: string;
  candidateId: string;
  reasonLeavingLastJob: string;
  lastJobDescription: string;
  reasonApplying: string;
  relevantSkills: string;
  lastSalary: string;
  expectedSalary: string;
  activeLanguage: string;
  willingToTransfer: string;
  willingToDoubleWork: string;
  knownEmployees: string;
  readyToWork: string;
  employeeRelationship: string;
  referenceContactName: string;
  referenceContactPhone: string;
  createdAt: string;
  updatedAt: string;
}

// --- Interview/Assessment Progress (from HRIS) ---

export interface InterviewStageStatus {
  status: string;
  passed: boolean;
  failed: boolean;
  pending: boolean;
  locked: boolean;
  description: string;
}

export interface InterviewProgress {
  interview1: InterviewStageStatus;
  interview2: InterviewStageStatus;
  currentStage: "interview1" | "interview2" | "mcu" | "completed" | "failed";
  interviewStarted: boolean;
  interviewStartedAt: string | null;
  interviewDate: string | null;
  interviewType: string | null;
  allPassed: boolean;
  anyFailed: boolean;
}

// --- MCU Status (from HRIS) ---

export interface McuStatus {
  status: string;
  description: string;
  documentUrl: string | null;
  documentName: string | null;
}

// --- Onboarding (from HRIS) ---

export interface OnboardingFacility {
  id: number;
  inventoryNo: string;
  item: string;
  qty: number;
  unit: string;
  condition: string;
  status: string;
}

export interface OnboardingProgram {
  id: number;
  program: string;
  date: string;
  location: string;
  pic: string;
  status: string;
}

export interface OnboardingData {
  id: number;
  candidateId: number;
  jobPlacement: string;
  document: string;
  documentCandidate: string;
  facilities: OnboardingFacility[];
  programs: OnboardingProgram[];
  createdAt: string | null;
  updatedAt: string | null;
}
