// Product management models for Angular frontend
// These interfaces match the backend DTOs for type safety

// ========== PRODUCT REQUEST MODELS ==========

export interface CreateProductRequest {
  reference: string;
  designation: string;
  description: string;
  categorieId: number;
  sousCategorie: string;
  prixAchat: number;
  prixVente: number;
  prixVenteMin: number;
  // Essential price fields (HT values)
  tauxTVA: number;
  prixAchatHT: number;
  prixVenteHT: number;
  prixVenteMinHT: number;
  // Legacy fields (to be removed gradually)
  prixAchatTTC: number;
  prixVenteTTC: number;
  prixVenteMinTTC: number;
  unite: string;
  stockActuel: number;
  stockMinimum: number;
  stockMaximum: number;
  statut: string;
  variantes: CreateVariantRequest[];
}

export interface UpdateProductRequest {
  id: number;
  reference: string;
  designation: string;
  description: string;
  categorieId: number;
  sousCategorie: string;
  prixAchat: number;
  prixVente: number;
  prixVenteMin: number;
  // Essential price fields (HT values)
  tauxTVA: number;
  prixAchatHT: number;
  prixVenteHT: number;
  prixVenteMinHT: number;
  // Legacy fields (to be removed gradually)
  prixAchatTTC: number;
  prixVenteTTC: number;
  prixVenteMinTTC: number;
  unite: string;
  stockActuel: number;
  stockMinimum: number;
  stockMaximum: number;
  statut: string;
  variantes: UpdateVariantRequest[];
}

export interface ProductSearchRequest {
  searchTerm?: string;
  categorieId?: number;
  sousCategorie?: string;
  statut?: string;
  prixMin?: number;
  prixMax?: number;
  stockFaible?: boolean;
  ruptureStock?: boolean;
  unite?: string;
  dateCreationFrom?: Date;
  dateCreationTo?: Date;
  sortBy: string;
  sortDirection: string;
  page: number;
  pageSize: number;
}

export interface StockAdjustmentRequest {
  productId: number;
  newQuantity: number;
  reason: string;
  reference: string;
  emplacement: string;
}

// ========== VARIANT REQUEST MODELS ==========

export interface CreateVariantRequest {
  taille: string;
  couleur: string;
  referenceVariant: string;
  stockActuel: number;
}

export interface UpdateVariantRequest {
  id: number;
  taille: string;
  couleur: string;
  referenceVariant: string;
}

// ========== CATEGORY REQUEST MODELS ==========

export interface CreateCategoryRequest {
  nom: string;
  description: string;
  categorieParentId?: number;
  estActif: boolean;
}

export interface UpdateCategoryRequest {
  id: number;
  nom: string;
  description: string;
  categorieParentId?: number;
  estActif: boolean;
}

// ========== RESPONSE MODELS ==========

export interface ProductResponse {
  id: number;
  reference: string;
  designation: string;
  description: string;
  categorieId: number;
  categorie: string;
  sousCategorie: string;
  prixAchat: number;
  prixVente: number;
  prixVenteMin: number;
  // Essential price fields (HT values)
  tauxTVA: number;
  prixAchatHT: number;
  prixVenteHT: number;
  prixVenteMinHT: number;
  // Calculated TTC values (computed at runtime)
  prixAchatTTC: number;
  prixVenteTTC: number;
  prixVenteMinTTC: number;
  // Legacy fields (to be removed gradually)
  unite: string;
  statut: string;
  stockActuel: number;
  stockMinimum: number;
  stockMaximum: number;
  estStockFaible: boolean;
  estRuptureStock: boolean;
  valeurStock: number;
  margeBrute: number;
  pourcentageMarge: number;
  dateCreation: Date;
  dateModification?: Date;
  variantes: VariantResponse[];
  derniersMovements: StockMovementResponse[];
}

export interface VariantResponse {
  id: number;
  produitId: number;
  taille: string;
  couleur: string;
  referenceVariant: string;
  stockActuel: number;
  estRuptureStock: boolean;
}

export interface CategoryResponse {
  id: number;
  nom: string;
  description: string;
  categorieParentId?: number;
  categorieParent: string;
  estActif: boolean;
  nombreProduits: number;
  nombreSousCategories: number;
  dateCreation: Date;
  dateModification?: Date;
  sousCategories: CategoryResponse[];
}

export interface StockMovementResponse {
  id: number;
  produitId: number;
  produitReference: string;
  produitDesignation: string;
  dateMouvement: Date;
  type: string;
  quantite: number;
  referenceDocument: string;
  emplacement: string;
  creePar: string;
}

export interface ProductListResponse {
  products: ProductResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProductStatsResponse {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  totalStockValue: number;
  averagePrice: number;
  averageMargin: number;
  topCategories: CategoryStatsResponse[];
  lowStockAlerts: ProductResponse[];
  outOfStockAlerts: ProductResponse[];
}

export interface CategoryStatsResponse {
  categorieId: number;
  nom: string;
  nombreProduits: number;
  valeurStock: number;
  pourcentageTotal: number;
}

// ========== API RESPONSE WRAPPER ==========

export interface ProductApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors: string[];
}

// ========== UTILITY INTERFACES ==========

export interface ProductFilter {
  searchTerm: string;
  categorieId: number | null;
  sousCategorie: string;
  statut: string;
  prixMin: number | null;
  prixMax: number | null;
  stockFaible: boolean;
  ruptureStock: boolean;
  unite: string;
  dateCreationFrom: Date | null;
  dateCreationTo: Date | null;
}

export interface ProductSort {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface ProductPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

// ========== ENUMS ==========

export enum ProductStatus {
  ACTIF = 'Actif',
  INACTIF = 'Inactif',
  DISCONTINUE = 'Discontinué',
  RUPTURE = 'Rupture'
}

export enum ProductUnit {
  PIECE = 'Pièce',
  KG = 'Kg',
  LITRE = 'Litre',
  METRE = 'Mètre',
  METRE_CARRE = 'M²',
  METRE_CUBE = 'M³',
  BOITE = 'Boîte',
  PAQUET = 'Paquet',
  CARTON = 'Carton',
  PALETTE = 'Palette',
  GRAMME = 'Gramme',
  TONNE = 'Tonne',
  MILLILITRE = 'Millilitre',
  CENTIMETRE = 'Centimètre',
  MILLIMETRE = 'Millimètre'
}

export enum StockMovementType {
  STOCK_INITIAL = 'Stock Initial',
  AJUSTEMENT_PLUS = 'Ajustement +',
  AJUSTEMENT_MOINS = 'Ajustement -',
  ENTREE = 'Entrée',
  SORTIE = 'Sortie',
  TRANSFERT = 'Transfert',
  INVENTAIRE = 'Inventaire'
}

// ========== FORM INTERFACES ==========

export interface ProductFormData {
  id?: number;
  reference: string;
  designation: string;
  description: string;
  categorieId: number | null;
  sousCategorie: string;
  prixAchat: number;
  prixVente: number;
  prixVenteMin: number;
  // Essential price fields (HT values)
  tauxTVA: number;
  prixAchatHT: number;
  prixVenteHT: number;
  prixVenteMinHT: number;
  // Legacy fields (to be removed gradually)
  prixAchatTTC: number;
  prixVenteTTC: number;
  prixVenteMinTTC: number;
  unite: string;
  stockActuel: number;
  stockMinimum: number;
  stockMaximum: number;
  statut: string;
  variantes: VariantFormData[];
}

export interface VariantFormData {
  id?: number;
  taille: string;
  couleur: string;
  referenceVariant: string;
  stockActuel: number;
}

export interface CategoryFormData {
  id?: number;
  nom: string;
  description: string;
  categorieParentId: number | null;
  estActif: boolean;
}

export interface StockAdjustmentFormData {
  productId: number;
  currentStock: number;
  newQuantity: number;
  reason: string;
  reference: string;
  emplacement: string;
}

// ========== TABLE INTERFACES ==========

export interface ProductTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  type: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'boolean';
  width?: string;
}

export interface ProductTableAction {
  icon: string;
  label: string;
  color: string;
  permission?: string;
  action: (product: ProductResponse) => void;
}

// ========== CHART DATA INTERFACES ==========

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ProductChartData {
  categoryDistribution: ChartData;
  stockValueByCategory: ChartData;
  stockLevels: ChartData;
  priceDistribution: ChartData;
}