
export interface RecommendationResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ProductRecommendation {
  id: number;
  reference: string;
  designation: string;
  categorie: string;
  prixVente: number;
  stockActuel: number;
  pourcentageMarge: number;
  score: number;
}