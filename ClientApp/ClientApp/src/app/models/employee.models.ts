// ========== EMPLOYEE MODELS ==========

export interface Employee {
  id: number;
  nom: string;
  prenom: string;
  nomComplet: string;
  cin: string;
  poste: string;
  departement: string;
  email: string;
  telephone: string;
  dateEmbauche: Date;
  statut: string;
  hasUserAccount: boolean;
  userRole?: string;
  dateCreation: Date;
  dateModification: Date;
}

// ========== REQUEST MODELS ==========

export interface CreateEmployeeRequest {
  nom: string;
  prenom: string;
  cin: string;
  poste: string;
  departement: string;
  email: string;
  telephone: string;
  dateEmbauche: Date;
  statut: string;
}

export interface UpdateEmployeeRequest {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  poste: string;
  departement: string;
  email: string;
  telephone: string;
  dateEmbauche: Date;
  statut: string;
}

export interface EmployeeSearchRequest {
  searchTerm?: string;
  departement?: string;
  poste?: string;
  statut?: string;
  dateEmbaucheFrom?: Date;
  dateEmbaucheTo?: Date;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

// ========== RESPONSE MODELS ==========

export interface EmployeeListResponse {
  employees: Employee[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EmployeeStatsResponse {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  employeesByDepartment: { [key: string]: number };
  employeesByStatus: { [key: string]: number };
  newEmployeesThisMonth: number;
  newEmployeesThisYear: number;
}

export interface DepartmentResponse {
  name: string;
  employeeCount: number;
}

export interface PositionResponse {
  name: string;
  employeeCount: number;
}

export interface EmployeeApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: Date;
}

// ========== UTILITY TYPES ==========

export interface EmployeeFilter {
  departments: string[];
  positions: string[];
  statuses: string[];
}

export interface EmployeeFormData {
  nom: string;
  prenom: string;
  cin: string;
  poste: string;
  departement: string;
  email: string;
  telephone: string;
  dateEmbauche: string; // For form handling as string
  statut: string;
}