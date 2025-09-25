// Authentication Data Transfer Objects (DTOs)
// These interfaces match the backend DTOs for type safety

export interface LoginRequest {
  nomUtilisateur: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nomUtilisateur: string;
  motDePasse: string;
  confirmerMotDePasse: string;
  role: string;
  employeId: number;
}

export interface ChangePasswordRequest {
  motDePasseActuel: string;
  nouveauMotDePasse: string;
  confirmerNouveauMotDePasse: string;
}

export interface ResetPasswordRequest {
  nomUtilisateur: string;
  nouveauMotDePasse: string;
  confirmerNouveauMotDePasse: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  expiration?: Date;
  userInfo?: UserInfo;
}

export interface UserInfo {
  id: number;
  nomUtilisateur: string;
  role: string;
  employeId: number;
  nomEmploye: string;
  prenomEmploye: string;
  poste: string;
  departement: string;
  derniereConnexion: Date;
}

export interface UserProfile {
  id: number;
  nomUtilisateur: string;
  role: string;
  employeId: number;
  nomEmploye: string;
  prenomEmploye: string;
  poste: string;
  departement: string;
  email: string;
  telephone: string;
  dateCreation: Date;
  derniereConnexion: Date;
  estActif: boolean;
}

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
  salaireBase: number;
  prime: number;
  salaireTotal: number;
  dateEmbauche: Date;
  statut: string;
  hasUserAccount: boolean;
  userRole: string;
  dateCreation: Date;
  dateModification: Date;
}

export interface EmployeeApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: Date;
}

// Authentication state interface for the service
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserInfo | null;
  tokenExpiration: Date | null;
}

// Role enumeration to match backend roles
export enum UserRole {
  ADMIN = 'Admin',
  VENDEUR = 'Vendeur',
  ACHETEUR = 'Acheteur',
  COMPTABLE = 'Comptable',
  RH = 'RH'
}

// API Error Response interface
export interface ApiError {
  message: string;
  status: number;
  error?: any;
}