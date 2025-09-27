// Sales Management models for Angular frontend
// These interfaces match the backend DTOs for type safety

// ========== SALES QUOTE REQUEST MODELS ==========

export interface CreateQuoteRequest {
  clientId: number;
  dateExpiration: Date;
  remise: number;
  lignes: CreateQuoteLine[];
}

export interface CreateQuoteLine {
  produitId: number;
  quantite: number;
  prixUnitaire: number;
}

export interface UpdateQuoteRequest extends CreateQuoteRequest {
  id: number;
}

export interface QuoteSearchRequest {
  clientId?: number | null;
  statut?: string | null;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

// ========== SALES ORDER REQUEST MODELS ==========

export interface CreateSalesOrderRequest {
  clientId: number;
  devisId?: number | null;
  modeLivraison: string;
  conditionsPaiement: string;
  lignes: CreateSalesOrderLine[];
}

export interface CreateSalesOrderLine {
  produitId: number;
  quantite: number;
  prixUnitaire: number;
}

export interface UpdateSalesOrderRequest extends CreateSalesOrderRequest {
  id: number;
}

export interface SalesOrderSearchRequest {
  clientId?: number | null;
  statut?: string | null;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

// ========== DELIVERY REQUEST MODELS ==========

export interface CreateDeliveryRequest {
  commandeId: number;
  dateLivraison: Date;
  transportateur: string;
  numeroSuivi: string;
  lignes: CreateDeliveryLine[];
}

export interface CreateDeliveryLine {
  commandeLigneId: number;
  quantite: number;
}

// ========== INVOICE REQUEST MODELS ==========

export interface CreateInvoiceRequest {
  commandeId: number;
  dateEcheance: Date;
  lignes: CreateInvoiceLine[];
}

export interface CreateInvoiceLine {
  commandeLigneId: number;
  quantite: number;
  prixUnitaire: number;
}

// ========== RETURN REQUEST MODELS ==========

export interface CreateReturnRequest {
  factureId: number;
  motif: string;
  lignes: CreateReturnLine[];
}

export interface CreateReturnLine {
  factureLigneId: number;
  quantite: number;
}

// ========== RESPONSE MODELS ==========

export interface QuoteLineResponse {
  id: number;
  devisId: number;
  produitId: number;
  produit: {
    id: number;
    reference: string;
    designation: string;
    description: string;
    categorie: string;
    sousCategorie: string;
    prixAchat: number;
    prixVente: number;
    prixVenteMin: number;
    unite: string;
    statut: string;
    stockActuel: number;
    stockMinimum: number;
    stockMaximum: number;
  };
  quantite: number;
  prixUnitaire: number;
  totalLigne: number;
}

export interface QuoteResponse {
  id: number;
  clientId: number;
  client: {
    id: number;
    nom: string;
    prenom: string;
    raisonSociale: string;
    typeClient: string;
    ice: string;
    adresse: string;
    ville: string;
    codePostal: string;
    pays: string;
    telephone: string;
    email: string;
    classification: string;
    limiteCredit: number;
    soldeActuel: number;
    estActif: boolean;
    dateCreation: Date;
  };
  dateCreation: Date;
  dateExpiration: Date;
  statut: string; // Brouillon, Envoyé, Accepté, Rejeté
  montantHT: number;
  montantTTC: number;
  remise: number;
  lignes: QuoteLineResponse[];
}

export interface SalesOrderLineResponse {
  id: number;
  commandeId: number;
  produitId: number;
  produit: {
    id: number;
    reference: string;
    designation: string;
    description: string;
    categorie: string;
    sousCategorie: string;
    prixAchat: number;
    prixVente: number;
    prixVenteMin: number;
    unite: string;
    statut: string;
    stockActuel: number;
    stockMinimum: number;
    stockMaximum: number;
  };
  quantite: number;
  prixUnitaire: number;
  totalLigne: number;
}

export interface SalesOrderResponse {
  id: number;
  clientId: number;
  client: {
    id: number;
    nom: string;
    prenom: string;
    raisonSociale: string;
    typeClient: string;
    ice: string;
    adresse: string;
    ville: string;
    codePostal: string;
    pays: string;
    telephone: string;
    email: string;
    classification: string;
    limiteCredit: number;
    soldeActuel: number;
    estActif: boolean;
    dateCreation: Date;
  };
  devisId?: number | null;
  dateCommande: Date;
  statut: string; // Brouillon, Confirmé, Expédié, Livré, Annulé
  montantHT: number;
  montantTTC: number;
  modeLivraison: string;
  conditionsPaiement: string;
  lignes: SalesOrderLineResponse[];
  livraisons: any[]; // We'll define this properly if needed
  factures: any[]; // We'll define this properly if needed
}

export interface DeliveryLineResponse {
  id: number;
  livraisonId: number;
  produitId: number;
  produit: {
    id: number;
    reference: string;
    designation: string;
    description: string;
    categorie: string;
    sousCategorie: string;
    prixAchat: number;
    prixVente: number;
    prixVenteMin: number;
    unite: string;
    statut: string;
    stockActuel: number;
    stockMinimum: number;
    stockMaximum: number;
  };
  quantite: number;
}

export interface DeliveryResponse {
  id: number;
  commandeId: number;
  commande: SalesOrderResponse;
  dateLivraison: Date;
  statut: string; // En préparation, Expédié, Livré, Partiel
  transportateur: string;
  numeroSuivi: string;
  lignes: DeliveryLineResponse[];
}

export interface InvoiceLineResponse {
  id: number;
  factureId: number;
  produitId: number;
  produit: {
    id: number;
    reference: string;
    designation: string;
    description: string;
    categorie: string;
    sousCategorie: string;
    prixAchat: number;
    prixVente: number;
    prixVenteMin: number;
    unite: string;
    statut: string;
    stockActuel: number;
    stockMinimum: number;
    stockMaximum: number;
  };
  quantite: number;
  prixUnitaire: number;
  totalLigne: number;
}

export interface InvoiceResponse {
  id: number;
  commandeId: number;
  commande: SalesOrderResponse;
  clientId: number;
  client: {
    id: number;
    nom: string;
    prenom: string;
    raisonSociale: string;
    typeClient: string;
    ice: string;
    adresse: string;
    ville: string;
    codePostal: string;
    pays: string;
    telephone: string;
    email: string;
    classification: string;
    limiteCredit: number;
    soldeActuel: number;
    estActif: boolean;
    dateCreation: Date;
  };
  dateFacture: Date;
  dateEcheance: Date;
  statut: string; // Brouillon, Envoyée, Payée, Partielle, En retard
  montantHT: number;
  montantTTC: number;
  montantPaye: number;
  lignes: InvoiceLineResponse[];
  retours: any[]; // We'll define this properly if needed
  paiements: any[]; // We'll define this properly if needed
}

export interface ReturnLineResponse {
  id: number;
  retourId: number;
  produitId: number;
  produit: {
    id: number;
    reference: string;
    designation: string;
    description: string;
    categorie: string;
    sousCategorie: string;
    prixAchat: number;
    prixVente: number;
    prixVenteMin: number;
    unite: string;
    statut: string;
    stockActuel: number;
    stockMinimum: number;
    stockMaximum: number;
  };
  quantite: number;
}

export interface ReturnResponse {
  id: number;
  factureId: number;
  facture: InvoiceResponse;
  clientId: number;
  client: {
    id: number;
    nom: string;
    prenom: string;
    raisonSociale: string;
    typeClient: string;
    ice: string;
    adresse: string;
    ville: string;
    codePostal: string;
    pays: string;
    telephone: string;
    email: string;
    classification: string;
    limiteCredit: number;
    soldeActuel: number;
    estActif: boolean;
    dateCreation: Date;
  };
  dateRetour: Date;
  motif: string;
  statut: string; // En attente, Traité, Remboursé, Échange
  lignes: ReturnLineResponse[];
}

export interface QuoteListResponse {
  devis: QuoteResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SalesOrderListResponse {
  commandes: SalesOrderResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ========== API RESPONSE WRAPPER ==========

export interface SalesApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: Date;
}

// ========== UTILITY MODELS ==========

export interface SalesQuoteFilter {
  clientId?: number | null;
  statut?: string | null;
  dateDebut?: Date | null;
  dateFin?: Date | null;
}

export interface SalesOrderFilter {
  clientId?: number | null;
  statut?: string | null;
  dateDebut?: Date | null;
  dateFin?: Date | null;
}

export interface SalesQuoteSort {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface SalesOrderSort {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface SalesQuotePagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface SalesOrderPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}