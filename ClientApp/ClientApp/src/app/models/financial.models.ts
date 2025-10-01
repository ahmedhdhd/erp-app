export interface Transaction {
    id: number;
    type: string;
    montant: number;
    description: string;
    dateTransaction: Date;
    clientId?: number;
    clientNom?: string;
    fournisseurId?: number;
    fournisseurNom?: string;
    employeId?: number;
    employeNom?: string;
    categoryId?: number;
    categoryNom?: string;
    statut: string;
    methodePaiement: string;
    reference: string;
    notes: string;
    dateCreation: Date;
    dateModification: Date;
}

export interface CreateTransactionRequest {
    type: string;
    montant: number;
    description: string;
    dateTransaction: Date;
    clientId?: number;
    fournisseurId?: number;
    employeId?: number;
    categoryId?: number;
    statut: string;
    methodePaiement: string;
    reference: string;
    notes: string;
}

export interface UpdateTransactionRequest extends CreateTransactionRequest {
    id: number;
}

export interface TransactionCategory {
    id: number;
    nom: string;
    description: string;
    type: string;
    parentCategoryId?: number;
    parentCategoryNom?: string;
    dateCreation: Date;
    dateModification: Date;
}

export interface CreateCategoryRequest {
    nom: string;
    description: string;
    type: string;
    parentCategoryId?: number;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
    id: number;
}

export interface Budget {
    id: number;
    nom: string;
    description: string;
    categoryId?: number;
    categoryNom?: string;
    montantPrevu: number;
    montantDepense: number;
    dateDebut: Date;
    dateFin: Date;
    statut: string;
    notes: string;
    dateCreation: Date;
    dateModification: Date;
}

export interface CreateBudgetRequest {
    nom: string;
    description: string;
    categoryId?: number;
    montantPrevu: number;
    montantDepense: number;
    dateDebut: Date;
    dateFin: Date;
    statut: string;
    notes: string;
}

export interface UpdateBudgetRequest extends CreateBudgetRequest {
    id: number;
}

export interface FinancialReport {
    id: number;
    titre: string;
    description: string;
    dateDebut: Date;
    dateFin: Date;
    dateGeneration: Date;
    revenusTotal: number;
    depensesTotal: number;
    profit: number;
    tauxCroissance: number;
    contenu: string;
    type: string;
    statut: string;
    dateCreation: Date;
    dateModification: Date;
}

export interface CreateFinancialReportRequest {
    titre: string;
    description: string;
    dateDebut: Date;
    dateFin: Date;
    revenusTotal: number;
    depensesTotal: number;
    profit: number;
    tauxCroissance: number;
    contenu: string;
    type: string;
    statut: string;
}

export interface UpdateFinancialReportRequest extends CreateFinancialReportRequest {
    id: number;
}

export interface ClientApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    totalCount?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    timestamp: Date;
}