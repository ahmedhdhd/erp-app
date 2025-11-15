export interface ReglementResponse {
  id: number;
  nature: string;
  numero: string;
  montant: number;
  date: string;
  banque?: string | null;
  dateEcheance?: string | null;
  type: 'Fournisseur' | 'Client';
  fournisseurId?: number | null;
  clientId?: number | null;
  commandeAchatId?: number | null;
  commandeVenteId?: number | null;
}

export interface CreateReglementRequest {
  nature: string;
  numero: string;
  montant: number;
  date: string;
  banque?: string | null;
  dateEcheance?: string | null;
  type: 'Fournisseur' | 'Client';
  fournisseurId?: number | null;
  clientId?: number | null;
  commandeAchatId?: number | null;
  commandeVenteId?: number | null;
}

export interface UpdateReglementRequest extends CreateReglementRequest {
  id: number;
}

export interface FinancialApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface JournalSearchRequest {
  type?: string;
  ownerId?: number;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: string;
  fournisseurId?: number;
  clientId?: number;
}

export interface JournalListResponse {
  journaux: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}


