import { get, post, put } from "@/lib/axios";
import type {
  EducationalBackground,
  WorkExperience,
  FamilyMember,
  CourseTraining,
  InterviewProgress,
  McuStatus,
  OnboardingData,
} from "@/types";

// --- Types ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Personal Info
export interface PersonalInfoFormData {
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
  drivingLicense: string;
  birthPlace: string;
  residentialStatus: string;
  birthDate: string;
  uniformShirtSize: string;
  maritalStatus: string;
  uniformPantsSize: string;
}

// Backend expects camelCase for this endpoint
interface PersonalInfoRequest {
  fullname?: string;
  idNo?: string;
  taxId?: string;
  citizenship?: string;
  bpjsId?: string;
  religion?: string;
  mobilePhone?: string;
  address?: string;
  domicileAddress?: string;
  drivingLicense?: string;
  birthPlace?: string;
  residentStatus?: string;
  birthDate?: string | null;
  uniformShirtSize?: string;
  marritalStatus?: string;
  uniformPantsSize?: string;
}

// Education
export type EducationFormData = Omit<EducationalBackground, "id">;

interface EducationRequest {
  school_university: string;
  city: string;
  degree: string;
  major: string;
  year_graduate: number;
}

interface ApiEducation {
  id: number;
  candidate_id: number;
  school_university: string;
  city: string;
  degree: string;
  major: string;
  year_graduate: number;
  created_at: string;
  updated_at: string;
}

// Work Experience
export type WorkExperienceFormData = Omit<WorkExperience, "id">;

interface WorkExperienceRequest {
  company: string;
  city: string;
  job_title: string;
  period: string;
  length_of_working: string;
}

interface ApiWorkExperience {
  id: number;
  candidate_id: number;
  company: string;
  city: string;
  job_title: string;
  period: string;
  length_of_working: string;
  created_at: string;
  updated_at: string;
}

// Family
export type FamilyMemberFormData = Omit<FamilyMember, "id">;

interface FamilyMemberRequest {
  name: string;
  relation: string;
  age: number;
  education: string;
  work: string;
}

interface ApiFamilyMember {
  id: number;
  candidate_id: number;
  name: string;
  relation: string;
  age: number;
  education: string;
  work: string;
  created_at: string;
  updated_at: string;
}

// Training
export type CourseTrainingFormData = Omit<CourseTraining, "id">;

interface CourseTrainingRequest {
  course_topic: string;
  provider: string;
  year: number;
  city: string;
  certificate: string;
}

interface ApiCourseTraining {
  id: number;
  candidate_id: number;
  course_topic: string;
  provider: string;
  year: number;
  city: string;
  certificate: string;
  created_at: string;
  updated_at: string;
}

// Assessment
export interface AssessmentFormData {
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
}

interface AssessmentRequest {
  reason_leaving_last_job?: string;
  last_job_description?: string;
  reason_applying?: string;
  relevant_skills?: string;
  last_salary?: string;
  expected_salary?: string;
  active_language?: string;
  willing_to_transfer?: string;
  willing_to_double_work?: string;
  known_employees?: string;
  ready_to_work?: string;
  employee_relationship?: string;
  reference_contact_name?: string;
  reference_contact_phone?: string;
}

interface ApiAssessment {
  id: number;
  candidate_id: number;
  reason_leaving_last_job: string;
  last_job_description: string;
  reason_applying: string;
  relevant_skills: string;
  last_salary: string;
  expected_salary: string;
  active_language: string;
  willing_to_transfer: string;
  willing_to_double_work: string;
  known_employees: string;
  ready_to_work: string;
  employee_relationship: string;
  reference_contact_name: string;
  reference_contact_phone: string;
  created_at: string;
  updated_at: string;
}

// --- Mappers ---

function mapEducation(api: ApiEducation): EducationalBackground {
  return {
    id: String(api.id),
    schoolUniversity: api.school_university,
    city: api.city,
    degree: api.degree,
    major: api.major,
    yearGraduate: api.year_graduate,
  };
}

function mapWorkExperience(api: ApiWorkExperience): WorkExperience {
  return {
    id: String(api.id),
    company: api.company,
    city: api.city,
    jobTitle: api.job_title,
    period: api.period,
    lengthOfWorking: api.length_of_working,
  };
}

function mapFamilyMember(api: ApiFamilyMember): FamilyMember {
  return {
    id: String(api.id),
    name: api.name,
    relation: api.relation,
    age: api.age,
    education: api.education,
    work: api.work,
  };
}

function mapCourseTraining(api: ApiCourseTraining): CourseTraining {
  return {
    id: String(api.id),
    courseTopic: api.course_topic,
    provider: api.provider,
    year: api.year,
    city: api.city,
    certificate: api.certificate,
  };
}

function mapAssessment(api: ApiAssessment): AssessmentFormData {
  return {
    reasonLeavingLastJob: api.reason_leaving_last_job || "",
    lastJobDescription: api.last_job_description || "",
    reasonApplying: api.reason_applying || "",
    relevantSkills: api.relevant_skills || "",
    lastSalary: api.last_salary || "",
    expectedSalary: api.expected_salary || "",
    activeLanguage: api.active_language || "",
    willingToTransfer: api.willing_to_transfer || "",
    willingToDoubleWork: api.willing_to_double_work || "",
    knownEmployees: api.known_employees || "",
    readyToWork: api.ready_to_work || "",
    employeeRelationship: api.employee_relationship || "",
    referenceContactName: api.reference_contact_name || "",
    referenceContactPhone: api.reference_contact_phone || "",
  };
}

// --- Request Builders ---

function buildPersonalInfoRequest(data: PersonalInfoFormData): PersonalInfoRequest {
  return {
    fullname: data.fullName,
    idNo: data.idNumber,
    taxId: data.taxIdNumber,
    citizenship: data.nationality,
    bpjsId: data.bpjsNumber,
    religion: data.religion,
    mobilePhone: data.mobilePhone,
    address: data.address,
    domicileAddress: data.domicileAddress,
    drivingLicense: data.drivingLicense,
    birthPlace: data.birthPlace,
    residentStatus: data.residentialStatus,
    birthDate: data.birthDate || null,
    uniformShirtSize: data.uniformShirtSize,
    marritalStatus: data.maritalStatus,
    uniformPantsSize: data.uniformPantsSize,
  };
}

function buildEducationRequest(data: EducationFormData): EducationRequest {
  return {
    school_university: data.schoolUniversity,
    city: data.city,
    degree: data.degree,
    major: data.major,
    year_graduate: data.yearGraduate,
  };
}

function buildWorkExperienceRequest(data: WorkExperienceFormData): WorkExperienceRequest {
  return {
    company: data.company,
    city: data.city,
    job_title: data.jobTitle,
    period: data.period,
    length_of_working: data.lengthOfWorking,
  };
}

function buildFamilyMemberRequest(data: FamilyMemberFormData): FamilyMemberRequest {
  return {
    name: data.name,
    relation: data.relation,
    age: data.age,
    education: data.education,
    work: data.work,
  };
}

function buildCourseTrainingRequest(data: CourseTrainingFormData): CourseTrainingRequest {
  return {
    course_topic: data.courseTopic,
    provider: data.provider,
    year: data.year,
    city: data.city,
    certificate: data.certificate,
  };
}

function buildAssessmentRequest(data: AssessmentFormData): AssessmentRequest {
  return {
    reason_leaving_last_job: data.reasonLeavingLastJob,
    last_job_description: data.lastJobDescription,
    reason_applying: data.reasonApplying,
    relevant_skills: data.relevantSkills,
    last_salary: data.lastSalary,
    expected_salary: data.expectedSalary,
    active_language: data.activeLanguage,
    willing_to_transfer: data.willingToTransfer,
    willing_to_double_work: data.willingToDoubleWork,
    known_employees: data.knownEmployees,
    ready_to_work: data.readyToWork,
    employee_relationship: data.employeeRelationship,
    reference_contact_name: data.referenceContactName,
    reference_contact_phone: data.referenceContactPhone,
  };
}

// --- Service ---

export const candidateProfileService = {
  // ==================== Personal Info ====================
  async savePersonalInfo(data: PersonalInfoFormData): Promise<ApiResponse<void>> {
    try {
      const payload = buildPersonalInfoRequest(data);
      console.log("[DEBUG] savePersonalInfo - input data:", data);
      console.log("[DEBUG] savePersonalInfo - payload:", payload);
      const response = await put<{ success?: boolean; message?: string }>(
        "/v1/candidate-auth/profile",
        payload
      );
      console.log("[DEBUG] savePersonalInfo - response:", response);

      if (response.success) {
        return { success: true };
      }
      return { success: false, message: response.message || "Failed to save personal info" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to save personal info",
      };
    }
  },

  // ==================== Education ====================
  async getEducation(): Promise<ApiResponse<EducationalBackground[]>> {
    try {
      const response = await get<{ success?: boolean; data?: ApiEducation[]; message?: string }>(
        "/v1/candidate-profile/education"
      );

      if (response.success && response.data) {
        return { success: true, data: response.data.map(mapEducation) };
      }
      return { success: false, message: response.message || "Failed to get education", data: [] };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to get education",
        data: [],
      };
    }
  },

  async saveEducation(data: EducationalBackground[]): Promise<ApiResponse<EducationalBackground[]>> {
    try {
      const payload = data.map((item) => buildEducationRequest(item));
      const response = await put<{ success?: boolean; data?: ApiEducation[]; message?: string }>(
        "/v1/candidate-profile/education",
        { items: payload }
      );

      if (response.success && response.data) {
        return { success: true, data: response.data.map(mapEducation) };
      }
      return { success: false, message: response.message || "Failed to save education" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to save education",
      };
    }
  },

  // ==================== Work Experience ====================
  async getWorkExperience(): Promise<ApiResponse<WorkExperience[]>> {
    try {
      const response = await get<{ success?: boolean; data?: ApiWorkExperience[]; message?: string }>(
        "/v1/candidate-profile/work-experience"
      );

      if (response.success && response.data) {
        return { success: true, data: response.data.map(mapWorkExperience) };
      }
      return { success: false, message: response.message || "Failed to get work experience", data: [] };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to get work experience",
        data: [],
      };
    }
  },

  async saveWorkExperience(data: WorkExperience[]): Promise<ApiResponse<WorkExperience[]>> {
    try {
      const payload = data.map((item) => buildWorkExperienceRequest(item));
      const response = await put<{ success?: boolean; data?: ApiWorkExperience[]; message?: string }>(
        "/v1/candidate-profile/work-experience",
        { items: payload }
      );

      if (response.success && response.data) {
        return { success: true, data: response.data.map(mapWorkExperience) };
      }
      return { success: false, message: response.message || "Failed to save work experience" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to save work experience",
      };
    }
  },

  // ==================== Family ====================
  async getFamily(): Promise<ApiResponse<FamilyMember[]>> {
    try {
      const response = await get<{ success?: boolean; data?: ApiFamilyMember[]; message?: string }>(
        "/v1/candidate-profile/family"
      );

      if (response.success && response.data) {
        return { success: true, data: response.data.map(mapFamilyMember) };
      }
      return { success: false, message: response.message || "Failed to get family", data: [] };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to get family",
        data: [],
      };
    }
  },

  async saveFamily(data: FamilyMember[]): Promise<ApiResponse<FamilyMember[]>> {
    try {
      const payload = data.map((item) => buildFamilyMemberRequest(item));
      const response = await put<{ success?: boolean; data?: ApiFamilyMember[]; message?: string }>(
        "/v1/candidate-profile/family",
        { items: payload }
      );

      if (response.success && response.data) {
        return { success: true, data: response.data.map(mapFamilyMember) };
      }
      return { success: false, message: response.message || "Failed to save family" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to save family",
      };
    }
  },

  // ==================== Training ====================
  async getTraining(): Promise<ApiResponse<CourseTraining[]>> {
    try {
      const response = await get<{ success?: boolean; data?: ApiCourseTraining[]; message?: string }>(
        "/v1/candidate-profile/training"
      );

      if (response.success && response.data) {
        return { success: true, data: response.data.map(mapCourseTraining) };
      }
      return { success: false, message: response.message || "Failed to get training", data: [] };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to get training",
        data: [],
      };
    }
  },

  async saveTraining(data: CourseTraining[]): Promise<ApiResponse<CourseTraining[]>> {
    try {
      const payload = data.map((item) => buildCourseTrainingRequest(item));
      const response = await put<{ success?: boolean; data?: ApiCourseTraining[]; message?: string }>(
        "/v1/candidate-profile/training",
        { items: payload }
      );

      if (response.success && response.data) {
        return { success: true, data: response.data.map(mapCourseTraining) };
      }
      return { success: false, message: response.message || "Failed to save training" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to save training",
      };
    }
  },

  // ==================== Assessment ====================
  async getAssessment(): Promise<ApiResponse<AssessmentFormData>> {
    try {
      const response = await get<{ success?: boolean; data?: ApiAssessment; message?: string }>(
        "/v1/candidate-profile/assessment"
      );

      if (response.success && response.data) {
        return { success: true, data: mapAssessment(response.data) };
      }
      return { success: false, message: response.message || "Failed to get assessment" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to get assessment",
      };
    }
  },

  async saveAssessment(data: AssessmentFormData): Promise<ApiResponse<AssessmentFormData>> {
    try {
      const payload = buildAssessmentRequest(data);
      const response = await put<{ success?: boolean; data?: ApiAssessment; message?: string }>(
        "/v1/candidate-profile/assessment",
        payload
      );

      if (response.success && response.data) {
        return { success: true, data: mapAssessment(response.data) };
      }
      return { success: false, message: response.message || "Failed to save assessment" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to save assessment",
      };
    }
  },

  // ==================== Interview Progress (Read-Only from HRIS) ====================
  async getInterviewProgress(): Promise<ApiResponse<InterviewProgress | null>> {
    try {
      const response = await get<{
        success: boolean;
        data: {
          interview1: { status: string; passed: boolean; failed: boolean; pending: boolean; locked: boolean; description: string };
          interview2: { status: string; passed: boolean; failed: boolean; pending: boolean; locked: boolean; description: string };
          current_stage: string;
          interview_started: boolean;
          interview_started_at: string | null;
          interview_date: string | null;
          interview_type: string | null;
          all_passed: boolean;
          any_failed: boolean;
        } | null;
      }>("/v1/candidate-profile/interview-progress");

      if (response.success && response.data) {
        const d = response.data;
        return {
          success: true,
          data: {
            interview1: d.interview1,
            interview2: d.interview2,
            currentStage: d.current_stage as InterviewProgress["currentStage"],
            interviewStarted: d.interview_started,
            interviewStartedAt: d.interview_started_at,
            interviewDate: d.interview_date,
            interviewType: d.interview_type,
            allPassed: d.all_passed,
            anyFailed: d.any_failed,
          },
        };
      }

      return { success: true, data: null };
    } catch {
      return { success: false, message: "Failed to fetch interview progress" };
    }
  },

  // ==================== MCU Status (Read-Only from HRIS) ====================
  async getMcuStatus(): Promise<ApiResponse<McuStatus | null>> {
    try {
      const response = await get<{
        success: boolean;
        data: {
          status: string;
          description: string;
          document_url: string | null;
          document_name: string | null;
        } | null;
      }>("/v1/candidate-profile/mcu-status");

      if (response.success && response.data) {
        const d = response.data;
        return {
          success: true,
          data: {
            status: d.status,
            description: d.description,
            documentUrl: d.document_url,
            documentName: d.document_name,
          },
        };
      }

      return { success: true, data: null };
    } catch {
      return { success: false, message: "Failed to fetch MCU status" };
    }
  },

  // ==================== Onboarding (Read-Only from HRIS) ====================
  async getOnboarding(): Promise<ApiResponse<OnboardingData | null>> {
    try {
      const response = await get<{
        success: boolean;
        data: {
          id: number;
          candidate_id: number;
          job_placement: string;
          document: string;
          document_candidate: string;
          facilities: { id: number; inventory_no: string; item: string; qty: number; unit: string; condition: string; status: string }[];
          programs: { id: number; program: string; date: string; location: string; pic: string; status: string }[];
          created_at: string | null;
          updated_at: string | null;
        } | null;
      }>("/v1/candidate-profile/onboarding");

      if (response.success && response.data) {
        const d = response.data;
        return {
          success: true,
          data: {
            id: d.id,
            candidateId: d.candidate_id,
            jobPlacement: d.job_placement,
            document: d.document,
            documentCandidate: d.document_candidate,
            facilities: d.facilities.map((f) => ({
              id: f.id,
              inventoryNo: f.inventory_no,
              item: f.item,
              qty: f.qty,
              unit: f.unit,
              condition: f.condition,
              status: f.status,
            })),
            programs: d.programs.map((p) => ({
              id: p.id,
              program: p.program,
              date: p.date,
              location: p.location,
              pic: p.pic,
              status: p.status,
            })),
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          },
        };
      }

      return { success: true, data: null };
    } catch {
      return { success: false, message: "Failed to fetch onboarding data" };
    }
  },

  // ==================== Submit All (Batch Save) ====================
  async submitApplication(data: {
    personalInfo: PersonalInfoFormData;
    education: EducationalBackground[];
    workExperience: WorkExperience[];
    family: FamilyMember[];
    training: CourseTraining[];
    assessment: AssessmentFormData;
  }): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    console.log("[DEBUG] submitApplication called with data:", data);

    // Always save ALL sections when submitting application
    // This ensures no data is lost due to dirty tracking issues
    const personalInfoResult = await this.savePersonalInfo(data.personalInfo);
    console.log("[DEBUG] personalInfoResult:", personalInfoResult);
    if (!personalInfoResult.success) errors.push(`Personal Info: ${personalInfoResult.message}`);

    if (data.education.length > 0) {
      const result = await this.saveEducation(data.education);
      if (!result.success) errors.push(`Education: ${result.message}`);
    }

    if (data.workExperience.length > 0) {
      const result = await this.saveWorkExperience(data.workExperience);
      if (!result.success) errors.push(`Work Experience: ${result.message}`);
    }

    if (data.family.length > 0) {
      const result = await this.saveFamily(data.family);
      if (!result.success) errors.push(`Family: ${result.message}`);
    }

    if (data.training.length > 0) {
      const result = await this.saveTraining(data.training);
      if (!result.success) errors.push(`Training: ${result.message}`);
    }

    const assessmentResult = await this.saveAssessment(data.assessment);
    if (!assessmentResult.success) errors.push(`Assessment: ${assessmentResult.message}`);

    // If all sections saved successfully, mark biodata as submitted in backend
    if (errors.length === 0) {
      try {
        await post<ApiResponse<null>>("/candidate-profile/submit");
      } catch {
        errors.push("Failed to submit biodata");
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  },
};

export default candidateProfileService;
