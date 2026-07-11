export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type ShapValue = {
  feature: string;
  value: number;
  shap_value: number;
  description: string;
};

export type ApplicationDecision = 'APPROVED' | 'REJECTED' | 'REVIEW' | 'PENDING_REVIEW';

export type Application = {
  id: string;
  submittedById: string;
  applicantName: string;
  dateOfBirth: string;
  maritalStatus: string;
  numChildren: number;
  employmentType: string;
  employmentDurationYears: number;
  educationLevel: string;
  annualIncome: number;
  ownsVehicle: boolean;
  ownsRealEstate: boolean;
  housingType: string;
  numFamilyMembers: number;
  loanAmount: number;
  loanTermMonths: number;
  riskScore: number | null;
  decision: ApplicationDecision;
  shapValues: ShapValue[] | null;
  adminOverride: boolean;
  overriddenById: string | null;
  overriddenAt: string | null;
  createdAt: string;
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  overriddenBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
  meta?: PaginationMeta;
};

export type ApplicationsResponse = ApiResponse<Application[]>;
