// Supplier (Fournisseur) management models for Angular frontend
// These interfaces match the backend DTOs for type safety

// ========== SUPPLIER REQUEST MODELS ==========

export interface CreateSupplierRequest {
  raisonSociale: string;
  typeFournisseur: string; // Fabricant, Distributeur, Grossiste, Service
  ice: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
  email: string;
  conditionsPaiement: string; // Net15, Net30, etc.
  delaiLivraisonMoyen: number; // jours
  noteQualite: number; // 1-5
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  id: number;
}

export interface SupplierSearchRequest {
  searchTerm?: string;
  typeFournisseur?: string;
  ville?: string;
  conditionsPaiement?: string;
  delaiLivraisonMin?: number | null;
  delaiLivraisonMax?: number | null;
  noteQualiteMin?: number | null;
  noteQualiteMax?: number | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

export interface CreateSupplierContactRequest {
  nom: string;
  poste: string;
  telephone: string;
  email: string;
}

export interface UpdateSupplierContactRequest extends CreateSupplierContactRequest {
  id: number;
}

// ========== RESPONSE MODELS ==========

export interface SupplierContactResponse {
  id: number;
  nom: string;
  poste: string;
  telephone: string;
  email: string;
}

export interface SupplierResponse {
  id: number;
  raisonSociale: string;
  typeFournisseur: string;
  ice: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
  email: string;
  conditionsPaiement: string;
  delaiLivraisonMoyen: number;
  noteQualite: number;
  contacts: SupplierContactResponse[];
}

export interface SupplierListResponse {
  fournisseurs: SupplierResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SupplierStatsResponse {
  totalFournisseurs: number;
  fournisseursParType: { [key: string]: number };
  fournisseursParVille: { [key: string]: number };
  noteQualiteMoyenne: number;
  delaiLivraisonMoyenGlobal: number;
}

// ========== API RESPONSE WRAPPER ==========

export interface SupplierApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: Date;
}


