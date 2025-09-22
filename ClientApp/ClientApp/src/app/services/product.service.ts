import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  ProductResponse, 
  CreateProductRequest, 
  UpdateProductRequest,
  ProductSearchRequest,
  ProductApiResponse,
  ProductListResponse,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  VariantResponse,
  CreateVariantRequest,
  UpdateVariantRequest,
  StockMovementResponse,
  StockAdjustmentRequest,
  ProductStatsResponse,
  CategoryStatsResponse,
  ProductChartData
} 
from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/product`;
  private readonly categoryUrl = `${environment.apiUrl}/product/categories`;
  private readonly variantUrl = `${environment.apiUrl}/variant`;
  private readonly stockUrl = `${environment.apiUrl}/stock`;

  // State management
  private productsSubject = new BehaviorSubject<ProductResponse[]>([]);
  private categoriesSubject = new BehaviorSubject<CategoryResponse[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public products$ = this.productsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  // ==================== PRODUCT OPERATIONS ====================

  /**
   * Get all products with optional pagination
   */
  getProducts(page?: number, pageSize?: number): Observable<ProductApiResponse<ProductListResponse>> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (pageSize !== undefined) params = params.set('pageSize', pageSize.toString());

    this.loadingSubject.next(true);
    return this.http.get<ProductApiResponse<ProductListResponse>>(`${this.apiUrl}`, { params })
      .pipe(
        tap(response => {
          if (response.success && response.data && response.data.products) {
            this.productsSubject.next(response.data.products);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get product by ID
   */
  getProductById(id: number): Observable<ProductApiResponse<ProductResponse>> {
    return this.http.get<ProductApiResponse<ProductResponse>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new product
   */
  createProduct(product: CreateProductRequest): Observable<ProductApiResponse<ProductResponse>> {
    this.loadingSubject.next(true);
    return this.http.post<ProductApiResponse<ProductResponse>>(this.apiUrl, product)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const currentProducts = this.productsSubject.value || []; // Ensure it's an array
            this.productsSubject.next([...currentProducts, response.data]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing product
   */
  updateProduct(id: number, product: UpdateProductRequest): Observable<ProductApiResponse<ProductResponse>> {
    this.loadingSubject.next(true);
    return this.http.put<ProductApiResponse<ProductResponse>>(`${this.apiUrl}/${id}`, product)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const currentProducts = this.productsSubject.value || []; // Ensure it's an array
            const updatedProducts = currentProducts.map(p => 
              p.id === id ? response.data! : p
            );
            this.productsSubject.next(updatedProducts);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete product (soft delete)
   */
  deleteProduct(id: number): Observable<ProductApiResponse<any>> {
    this.loadingSubject.next(true);
    return this.http.delete<ProductApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => {
          if (response.success) {
            const currentProducts = this.productsSubject.value || []; // Ensure it's an array
            const filteredProducts = currentProducts.filter(p => p.id !== id);
            this.productsSubject.next(filteredProducts);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Search products with filters
   */
  searchProducts(searchRequest: ProductSearchRequest): Observable<ProductApiResponse<ProductListResponse>> {
    this.loadingSubject.next(true);
    return this.http.post<ProductApiResponse<ProductListResponse>>(`${this.apiUrl}/search`, searchRequest)
      .pipe(
        tap(response => {
          if (response.success && response.data && response.data.products) {
            this.productsSubject.next(response.data.products);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get products by category
   */
  getProductsByCategory(categoryId: number): Observable<ProductApiResponse<ProductResponse[]>> {
    return this.http.get<ProductApiResponse<ProductResponse[]>>(`${this.apiUrl}/category/${categoryId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(): Observable<ProductApiResponse<ProductResponse[]>> {
    return this.getStockAlerts().pipe(
      map((response: ProductApiResponse<ProductResponse[]>) => {
        if (response.success && response.data) {
          // Filter for products with low stock (not out of stock)
          const lowStockProducts = response.data.filter((p: ProductResponse) => p.stockActuel > 0 && p.stockActuel <= p.stockMinimum);
          return {
            ...response,
            data: lowStockProducts
          };
        }
        return response;
      })
    );
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(): Observable<ProductApiResponse<ProductResponse[]>> {
    return this.getStockAlerts().pipe(
      map((response: ProductApiResponse<ProductResponse[]>) => {
        if (response.success && response.data) {
          // Filter for products with no stock
          const outOfStockProducts = response.data.filter((p: ProductResponse) => p.stockActuel <= 0);
          return {
            ...response,
            data: outOfStockProducts
          };
        }
        return response;
      })
    );
  }

  // ==================== CATEGORY OPERATIONS ====================

  /**
   * Get all categories
   */
  getCategories(): Observable<ProductApiResponse<CategoryResponse[]>> {
    return this.http.get<ProductApiResponse<CategoryResponse[]>>(this.categoryUrl)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.categoriesSubject.next(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: number): Observable<ProductApiResponse<CategoryResponse>> {
    return this.http.get<ProductApiResponse<CategoryResponse>>(`${this.categoryUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new category
   */
  createCategory(category: CreateCategoryRequest): Observable<ProductApiResponse<CategoryResponse>> {
    return this.http.post<ProductApiResponse<CategoryResponse>>(this.categoryUrl, category)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const currentCategories = this.categoriesSubject.value || []; // Ensure it's an array
            this.categoriesSubject.next([...currentCategories, response.data]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing category
   */
  updateCategory(id: number, category: UpdateCategoryRequest): Observable<ProductApiResponse<CategoryResponse>> {
    return this.http.put<ProductApiResponse<CategoryResponse>>(`${this.categoryUrl}/${id}`, category)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const currentCategories = this.categoriesSubject.value || []; // Ensure it's an array
            const updatedCategories = currentCategories.map(c => 
              c.id === id ? response.data! : c
            );
            this.categoriesSubject.next(updatedCategories);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete category
   */
  deleteCategory(id: number): Observable<ProductApiResponse<any>> {
    return this.http.delete<ProductApiResponse<any>>(`${this.categoryUrl}/${id}`)
      .pipe(
        tap(response => {
          if (response.success) {
            const currentCategories = this.categoriesSubject.value || []; // Ensure it's an array
            const filteredCategories = currentCategories.filter(c => c.id !== id);
            this.categoriesSubject.next(filteredCategories);
          }
        }),
        catchError(this.handleError)
      );
  }

  // ==================== VARIANT OPERATIONS ====================

  /**
   * Get product variants
   */
  getProductVariants(productId: number): Observable<ProductApiResponse<VariantResponse[]>> {
    return this.http.get<ProductApiResponse<VariantResponse[]>>(`${this.variantUrl}/product/${productId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new variant
   */
  createVariant(variant: CreateVariantRequest): Observable<ProductApiResponse<VariantResponse>> {
    return this.http.post<ProductApiResponse<VariantResponse>>(this.variantUrl, variant)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update variant
   */
  updateVariant(id: number, variant: UpdateVariantRequest): Observable<ProductApiResponse<VariantResponse>> {
    return this.http.put<ProductApiResponse<VariantResponse>>(`${this.variantUrl}/${id}`, variant)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete variant
   */
  deleteVariant(id: number): Observable<ProductApiResponse<any>> {
    return this.http.delete<ProductApiResponse<any>>(`${this.variantUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ==================== STOCK OPERATIONS ====================

  /**
   * Get stock movements for a product
   */
  getStockMovements(productId: number, variantId?: number): Observable<ProductApiResponse<StockMovementResponse[]>> {
    let params = new HttpParams();
    if (variantId) params = params.set('variantId', variantId.toString());

    return this.http.get<ProductApiResponse<StockMovementResponse[]>>(`${this.stockUrl}/product/${productId}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create stock adjustment
   */
  createStockAdjustment(adjustment: StockAdjustmentRequest): Observable<ProductApiResponse<StockMovementResponse>> {
    return this.http.post<ProductApiResponse<StockMovementResponse>>(`${this.stockUrl}/adjust`, adjustment)
      .pipe(catchError(this.handleError));
  }

  // ==================== STATISTICS OPERATIONS ====================

  /**
   * Get product statistics
   */
  getProductStats(): Observable<ProductApiResponse<ProductStatsResponse>> {
    return this.http.get<ProductApiResponse<ProductStatsResponse>>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get category statistics
   */
  getCategoryStats(): Observable<ProductApiResponse<CategoryStatsResponse[]>> {
    return this.http.get<ProductApiResponse<CategoryStatsResponse[]>>(`${this.categoryUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get product chart data
   */
  getProductChartData(): Observable<ProductApiResponse<ProductChartData>> {
    return this.http.get<ProductApiResponse<ProductChartData>>(`${this.apiUrl}/chart-data`)
      .pipe(catchError(this.handleError));
  }

  // ==================== EXPORT OPERATIONS ====================

  /**
   * Export products to CSV
   */
  exportProducts(searchRequest?: ProductSearchRequest): Observable<Blob> {
    const headers = { 'Accept': 'text/csv' };
    const body = searchRequest || {};

    return this.http.post(`${this.apiUrl}/export/csv`, body, { 
      headers, 
      responseType: 'blob' 
    }).pipe(catchError(this.handleError));
  }

  /**
   * Update product status
   */
  updateProductStatus(productId: number, newStatus: string): Observable<ProductApiResponse<boolean>> {
    return this.http.patch<ProductApiResponse<boolean>>(`${this.apiUrl}/${productId}/status`, `"${newStatus}"`, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get stock alerts (low stock + out of stock products)
   */
  getStockAlerts(): Observable<ProductApiResponse<ProductResponse[]>> {
    return this.http.get<ProductApiResponse<ProductResponse[]>>(`${this.apiUrl}/stock/alerts`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all available product statuses
   */
  getProductStatuses(): Observable<ProductApiResponse<string[]>> {
    return this.http.get<ProductApiResponse<string[]>>(`${this.apiUrl}/statuses`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all available product units
   */
  getProductUnits(): Observable<ProductApiResponse<string[]>> {
    return this.http.get<ProductApiResponse<string[]>>(`${this.apiUrl}/units`)
      .pipe(catchError(this.handleError));
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Load initial data (categories and products)
   */
  private loadInitialData(): void {
    this.getCategories().subscribe();
    this.getProducts(1, 20).subscribe();
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    this.loadInitialData();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.productsSubject.next([]);
    this.categoriesSubject.next([]);
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    console.error('ProductService Error:', error);
    this.loadingSubject.next(false);
    
    let errorMessage = 'Une erreur est survenue lors de l\'opération.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else if (error.status === 401) {
      errorMessage = 'Vous n\'êtes pas autorisé à effectuer cette action.';
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé. Permissions insuffisantes.';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée.';
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    return throwError(() => new Error(errorMessage));
  };
}