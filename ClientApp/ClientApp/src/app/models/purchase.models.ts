// Purchase Management models for Angular frontend
// These interfaces match the backend DTOs for type safety

// ========== PURCHASE REQUEST MODELS ==========

export interface CreatePurchaseRequestRequest {
  employeId: number;
  titre: string;
  description: string;
  dateDemandee: Date;
  lignes: CreatePurchaseRequestLine[];
}

export interface CreatePurchaseRequestLine {
  produitId: number;
  quantite: number;
  motif: string;
}

export interface UpdatePurchaseRequestRequest extends CreatePurchaseRequestRequest {
  id: number;
}

export interface PurchaseRequestSearchRequest {
  searchTerm?: string;
  employeId?: number;
  statut?: string;
  dateMin?: Date | null;
  dateMax?: Date | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

export interface CreatePurchaseOrderRequest {
  fournisseurId: number;
  demandeId?: number | null;
  dateLivraisonPrevue: Date;
  lignes: CreatePurchaseOrderLine[];
}

export interface CreatePurchaseOrderLine {
  produitId: number;
  quantite: number;
  prixUnitaire: number;
}

export interface UpdatePurchaseOrderRequest extends CreatePurchaseOrderRequest {
  id: number;
}

export interface SubmitPurchaseOrderRequest {
  commandeId: number;
}

export interface CreateGoodsReceiptRequest {
  commandeId: number;
  dateReception: Date;
  lignes: CreateGoodsReceiptLine[];
}

export interface CreateGoodsReceiptLine {
  ligneCommandeId: number;
  quantiteRecue: number;
  quantiteRejetee: number;
  motifRejet: string;
}

export interface CreatePurchaseInvoiceRequest {
  commandeId: number;
  dateFacture: Date;
  dateEcheance: Date;
  lignes: CreatePurchaseInvoiceLine[];
}

export interface CreatePurchaseInvoiceLine {
  ligneCommandeId: number;
  quantiteFacturee: number;
  prixUnitaire: number;
}

// ========== RESPONSE MODELS ==========

export interface PurchaseRequestLineResponse {
  id: number;
  produitId: number;
  produit: {
    id: number;
    reference: string;
    nom: string;
    designation: string;
    description: string;
    tauxTVA: number;
  };
  quantite: number;
  motif: string;
}

export interface PurchaseRequestResponse {
  id: number;
  employeId: number;
  employe: {
    id: number;
    nom: string;
    prenom: string;
    poste: string;
  };
  titre: string;
  description: string;
  dateCreation: Date;
  dateDemandee: Date;
  statut: string; // Brouillon, Soumise, Approuvée, Refusée, Partielle, Complétée
  lignes: PurchaseRequestLineResponse[];
}

export interface PurchaseOrderLineResponse {
  id: number;
  produitId: number;
  produit: {
    id: number;
    reference: string;
    nom: string;
    designation: string;
    description: string;
    tauxTVA: number;
  };
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  prixUnitaireTTC: number;
  totalLigne: number;
}

export interface PurchaseOrderResponse {
  id: number;
  fournisseurId: number;
  fournisseur: {
    id: number;
    raisonSociale: string;
    ice: string;
  };
  demandeId: number;
  dateCommande: Date;
  dateLivraisonPrevue: Date;
  statut: string; // Brouillon, Envoyée, Partielle, Livrée, Annulée
  montantHT: number;
  montantTTC: number;
  lignes: PurchaseOrderLineResponse[];
  receptions: GoodsReceiptResponse[];
  factures: PurchaseInvoiceResponse[];
}

export interface GoodsReceiptLineResponse {
  id: number;
  ligneCommandeId: number;
  ligneCommande: PurchaseOrderLineResponse;
  quantiteRecue: number;
  quantiteRejetee: number;
  motifRejet: string;
}

export interface GoodsReceiptResponse {
  id: number;
  commandeId: number;
  dateReception: Date;
  lignes: GoodsReceiptLineResponse[];
}

export interface PurchaseInvoiceLineResponse {
  id: number;
  ligneCommandeId: number;
  ligneCommande: PurchaseOrderLineResponse;
  quantiteFacturee: number;
  prixUnitaire: number;
  totalLigne: number;
}

export interface PurchaseInvoiceResponse {
  id: number;
  commandeId: number;
  commande: PurchaseOrderResponse;
  fournisseurId: number;
  fournisseur: {
    id: number;
    raisonSociale: string;
    ice: string;
  };
  dateFacture: Date;
  dateEcheance: Date;
  statut: string; // Brouillon, Envoyée, Payée, Annulée
  montantHT: number;
  montantTTC: number;
  montantPaye: number;
  solde: number;
  lignes: PurchaseInvoiceLineResponse[];
  paiements: any[]; // We'll define this properly if needed
}

export interface PurchaseRequestListResponse {
  demandes: PurchaseRequestResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PurchaseOrderSearchRequest {
  fournisseurId?: number | null;
  statut?: string | null;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

export interface PurchaseOrderListResponse {
  commandes: PurchaseOrderResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ========== API RESPONSE WRAPPER ==========

export interface PurchaseApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: Date;
}