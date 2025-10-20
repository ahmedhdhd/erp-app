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


