// Client management models for Angular frontend
// These interfaces match the backend DTOs for type safety

// ========== CLIENT REQUEST MODELS ==========

export interface CreateClientRequest {
  nom: string;
  prenom: string;
  raisonSociale: string;
  typeClient: string; // Individuel, Entreprise, Grossiste, Détailant
  ice: string; // Identifiant Commun de l'Entreprise (Tunisie)
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
  email: string;
  classification: string; // VIP, Standard, Nouveau
  limiteCredit: number;
  estActif: boolean;
}

export interface UpdateClientRequest {
  id: number;
  nom: string;
  prenom: string;
  raisonSociale: string;
  typeClient: string; // Individuel, Entreprise, Grossiste, Détailant
  ice: string; // Identifiant Commun de l'Entreprise (Tunisie)
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
  email: string;
  classification: string; // VIP, Standard, Nouveau
  limiteCredit: number;
  estActif: boolean;
}

export interface ClientSearchRequest {
  searchTerm?: string;
  typeClient?: string;
  classification?: string;
  ville?: string;
  estActif?: boolean;
  creditMin?: number | null;
  creditMax?: number | null;
  dateCreationFrom?: Date | null;
  dateCreationTo?: Date | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

export interface CreateContactClientRequest {
  nom: string;
  poste: string;
  telephone: string;
  email: string;
  role: string; // Commercial, Financier, Technique
}

export interface UpdateContactClientRequest {
  id: number;
  nom: string;
  poste: string;
  telephone: string;
  email: string;
  role: string; // Commercial, Financier, Technique
}

// ========== RESPONSE MODELS ==========

export interface ContactClientResponse {
  id: number;
  nom: string;
  poste: string;
  telephone: string;
  email: string;
  role: string; // Commercial, Financier, Technique
}

export interface ClientResponse {
  id: number;
  nom: string;
  prenom: string;
  nomComplet: string;
  raisonSociale: string;
  typeClient: string; // Individuel, Entreprise, Grossiste, Détailant
  ice: string; // Identifiant Commun de l'Entreprise (Tunisie)
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
  email: string;
  classification: string; // VIP, Standard, Nouveau
  limiteCredit: number;
  soldeActuel: number;
  estActif: boolean;
  dateCreation: Date;
  contacts: ContactClientResponse[];
}

export interface ClientListResponse {
  clients: ClientResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ClientStatsResponse {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  clientsByType: { [key: string]: number };
  clientsByClassification: { [key: string]: number };
  clientsByCity: { [key: string]: number };
  averageCreditLimit: number;
  newClientsThisMonth: number;
  newClientsThisYear: number;
}

// ========== API RESPONSE WRAPPER ==========

export interface ClientApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: Date;
}

// ========== UTILITY MODELS ==========

export interface ClientFilter {
  types: string[];
  classifications: string[];
  cities: string[];
  statuses: boolean[];
}