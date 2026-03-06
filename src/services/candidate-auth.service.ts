import { post, get, put } from "@/lib/axios";

// --- Types ---

export interface Candidate {
  id: string;
  fullname: string;
  email: string;
  address: string;
  residentStatus: string;
  birthPlace: string;
  birthDate: string | null;
  religion: string;
  ethnicGroup: string;
  idNo: string;
  taxId: string;
  bpjsId: string;
  citizenship: string;
  marritalStatus: string;
  gender: string;
  mobilePhone: string;
  domicileAddress: string;
  drivingLicense: string;
  uniformShirtSize: string;
  uniformPantsSize: string;
  verify: string;
  agreementAcceptedAt: string | null;
  agreementVersion: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  candidateCode: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CandidateAuthResponse {
  candidate: Candidate;
  token: string;
}

export interface CandidateLoginRequest {
  email: string;
  password: string;
}

export interface CandidateProfileUpdateRequest {
  phone?: string;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary?: number;
  noticePeriod?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  notes?: string;
}

export interface CandidatePersonalInfoFormData {
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

interface CandidatePersonalInfoRequest {
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

// --- API Response Types ---

interface ApiCandidate {
  id: number;
  fullname: string;
  email: string;
  address: string;
  resident_status: string;
  birth_place: string;
  birth_date: string | null;
  religion: string;
  ethnic_group: string;
  id_no: string;
  tax_id: string;
  bpjs_id: string;
  citizenship: string;
  marrital_status: string;
  gender: string;
  mobile_phone: string;
  domicile_address: string;
  driving_license: string;
  uniform_shirt_size: string;
  uniform_pants_size: string;
  verify: string;
  agreement_accepted_at: string | null;
  agreement_version: string | null;
  created_at: string | null;
  updated_at: string | null;
  candidate_code: string | null;
}

// --- Mapping ---

function mapCandidate(api: ApiCandidate): Candidate {
  return {
    id: String(api.id),
    fullname: api.fullname,
    email: api.email,
    address: api.address || "",
    residentStatus: api.resident_status || "",
    birthPlace: api.birth_place || "",
    birthDate: api.birth_date,
    religion: api.religion || "",
    ethnicGroup: api.ethnic_group || "",
    idNo: api.id_no || "",
    taxId: api.tax_id || "",
    bpjsId: api.bpjs_id || "",
    citizenship: api.citizenship || "",
    marritalStatus: api.marrital_status || "",
    gender: api.gender || "",
    mobilePhone: api.mobile_phone || "",
    domicileAddress: api.domicile_address || "",
    drivingLicense: api.driving_license || "",
    uniformShirtSize: api.uniform_shirt_size || "",
    uniformPantsSize: api.uniform_pants_size || "",
    verify: api.verify,
    agreementAcceptedAt: api.agreement_accepted_at,
    agreementVersion: api.agreement_version,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
    candidateCode: api.candidate_code,
  };
}

// --- Service ---

export const candidateAuthService = {
  async login(data: CandidateLoginRequest): Promise<ApiResponse<CandidateAuthResponse>> {
    try {
      const response = await post<unknown, CandidateLoginRequest>(
        "/v1/candidate-auth/login",
        data
      );
      const res = response as {
        success?: boolean;
        data?: { candidate: ApiCandidate; token: string };
        message?: string;
      };

      if (res.success && res.data) {
        // Store token
        this.setToken(res.data.token);

        return {
          success: true,
          data: {
            candidate: mapCandidate(res.data.candidate),
            token: res.data.token,
          },
        };
      }

      return { success: false, message: res.message || "Login failed" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  },

  async verifyPassword(email: string, password: string): Promise<ApiResponse<{ valid: boolean }>> {
    try {
      const response = await post<unknown, { email: string; password: string }>(
        "/v1/candidate-auth/verify",
        { email, password }
      );
      const res = response as { success?: boolean; data?: { valid: boolean } };

      if (res.success && res.data) {
        return { success: true, data: res.data };
      }

      return { success: false, message: "Verification failed" };
    } catch (error: unknown) {
      return { success: false, message: "Verification failed" };
    }
  },

  async getProfile(): Promise<ApiResponse<Candidate>> {
    try {
      const response = await get<unknown>("/v1/candidate-auth/profile");
      const res = response as { success?: boolean; data?: ApiCandidate };

      if (res.success && res.data) {
        return { success: true, data: mapCandidate(res.data) };
      }

      return { success: false, message: "Failed to get profile" };
    } catch (error: unknown) {
      return { success: false, message: "Failed to get profile" };
    }
  },

  async updateProfile(
    data: CandidateProfileUpdateRequest
  ): Promise<ApiResponse<Candidate>> {
    try {
      const response = await put<unknown, CandidateProfileUpdateRequest>(
        "/v1/candidate-auth/profile",
        data
      );
      const res = response as { success?: boolean; data?: ApiCandidate; message?: string };

      if (res.success && res.data) {
        return { success: true, data: mapCandidate(res.data) };
      }

      return { success: false, message: res.message || "Failed to update profile" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile",
      };
    }
  },

  async updatePersonalInfo(
    data: CandidatePersonalInfoFormData
  ): Promise<ApiResponse<Candidate>> {
    try {
      const payload: CandidatePersonalInfoRequest = {
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

      const response = await put<unknown, CandidatePersonalInfoRequest>(
        "/v1/candidate-auth/profile",
        payload
      );
      const res = response as { success?: boolean; data?: ApiCandidate; message?: string };

      if (res.success && res.data) {
        return { success: true, data: mapCandidate(res.data) };
      }

      return { success: false, message: res.message || "Failed to save personal information" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to save personal information",
      };
    }
  },

  async acceptAgreement(version?: string): Promise<ApiResponse<Candidate>> {
    try {
      const response = await post<unknown, { version?: string }>(
        "/v1/candidate-auth/agreement",
        { version }
      );
      const res = response as { success?: boolean; data?: ApiCandidate; message?: string };

      if (res.success && res.data) {
        return { success: true, data: mapCandidate(res.data) };
      }

      return { success: false, message: res.message || "Failed to accept agreement" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Failed to accept agreement",
      };
    }
  },

  // Token management
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("candidate_auth_token", token);
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("candidate_auth_token");
    }
    return null;
  },

  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("candidate_auth_token");
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    this.clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
};

export default candidateAuthService;
