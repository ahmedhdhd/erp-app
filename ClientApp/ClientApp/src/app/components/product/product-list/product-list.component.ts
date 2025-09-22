import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { 
  ProductResponse, 
  ProductSearchRequest, 
  ProductApiResponse,
  CategoryResponse,
  ProductStatus,
  ProductUnit
} from '../../../models/product.models';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Data
  products: ProductResponse[] = [];
  categories: CategoryResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 25, 50, 100];

  // Expose Math to template
  Math = Math;

  // Loading and UI states
  loading = false;
  showFilters = false;
  selectedProducts: number[] = [];
  errorMessage = '';

  // Search and filters
  searchForm!: FormGroup;

  // Sorting
  sortField = 'designation';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Enums for template
  ProductStatus = ProductStatus;
  ProductUnit = ProductUnit;

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeSearchForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      categorieId: [null],
      statut: [null],
      prixMin: [null],
      prixMax: [null],
      stockMin: [null],
      stockMax: [null],
      stockFaible: [false],
      ruptureStock: [false],
      sortBy: ['designation'],
      sortDirection: ['asc']
    });
  }

  private loadInitialData(): void {
    this.loading = true;
    
    // Load categories first
    this.productService.getCategories().subscribe({
      next: (response: ProductApiResponse<CategoryResponse[]>) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
      },
      error: (error: any) => console.error('Error loading categories:', error)
    });

    // Load products
    this.loadProducts();
  }

  private setupSearchDebounce(): void {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  // ==================== DATA LOADING ====================

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    const searchRequest: ProductSearchRequest = this.buildSearchRequest();
    
    this.productService.searchProducts(searchRequest).subscribe({
      next: (response: ProductApiResponse<{ products: ProductResponse[], totalCount: number }>) => {
        this.loading = false;
        if (response.success && response.data) {
          this.products = response.data.products;
          this.filteredProducts = [...this.products];
          this.totalItems = response.data.totalCount;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des produits';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error.message || 'Erreur lors du chargement des produits';
        console.error('Error loading products:', error);
      }
    });
  }

  private buildSearchRequest(): ProductSearchRequest {
    const formValue = this.searchForm.value;
    
    return {
      searchTerm: formValue.searchTerm || '',
      categorieId: formValue.categorieId,
      statut: formValue.statut,
      prixMin: formValue.prixMin,
      prixMax: formValue.prixMax,
      stockFaible: formValue.stockFaible,
      ruptureStock: formValue.ruptureStock,
      sortBy: formValue.sortBy,
      sortDirection: formValue.sortDirection,
      page: this.currentPage,
      pageSize: this.pageSize
    };
  }

  // ==================== SEARCH AND FILTERING ====================

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onAdvancedSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchForm.reset({
      searchTerm: '',
      categorieId: null,
      statut: null,
      prixMin: null,
      prixMax: null,
      stockMin: null,
      stockMax: null,
      stockFaible: false,
      ruptureStock: false,
      sortBy: 'designation',
      sortDirection: 'asc'
    });
    this.currentPage = 1;
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // ==================== SORTING ====================

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'bi bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }

  // ==================== PAGINATION ====================

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  onPageSizeChange(event: any): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value);
    this.currentPage = 1;
    this.loadProducts();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // ==================== ACTIONS ====================

  viewProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  editProduct(id: number): void {
    this.router.navigate(['/products', id, 'edit']);
  }

  deleteProduct(id: number): void {
    const confirmMessage = 'Êtes-vous sûr de vouloir supprimer ce produit ?\n\n' +
      '⚠️ Cette action changera le statut du produit à "Inactif".\n' +
      'Les produits inactifs ne seront plus visibles dans les listes principales.';
    
    if (confirm(confirmMessage)) {
      this.productService.deleteProduct(id).subscribe({
        next: (response: ProductApiResponse<any>) => {
          if (response.success) {
            this.loadProducts();
            alert('✅ Produit désactivé avec succès!\nLe produit a été marqué comme inactif.');
          } else {
            alert(`❌ Échec de la désactivation:\n${response.message || 'Erreur inconnue du serveur'}`);
          }
        },
        error: (error: any) => {
          console.error('Error deleting product:', error);
          
          let errorMessage = 'Erreur lors de la désactivation du produit';
          if (error.status === 401) {
            errorMessage = 'Non autorisé - Votre session a expiré. Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé - Seuls les administrateurs peuvent supprimer des produits.';
          } else if (error.status === 404) {
            errorMessage = 'Produit non trouvé ou déjà supprimé.';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur interne. Contactez l\'administrateur.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          alert(`❌ ${errorMessage}`);
        }
      });
    }
  }

  createProduct(): void {
    this.router.navigate(['/products/new']);
  }

  // ==================== BULK ACTIONS ====================

  toggleProductSelection(productId: number): void {
    const index = this.selectedProducts.indexOf(productId);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else {
      this.selectedProducts.push(productId);
    }
  }

  selectAllProducts(): void {
    if (this.selectedProducts.length === this.filteredProducts.length) {
      this.selectedProducts = [];
    } else {
      this.selectedProducts = this.filteredProducts.map(p => p.id);
    }
  }

  isEmployeeSelected(productId: number): boolean {
    return this.selectedProducts.includes(productId);
  }

  // ==================== EXPORT ====================

  exportProducts(): void {
    const searchRequest = this.buildSearchRequest();
    
    this.productService.exportProducts(searchRequest).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Error exporting products:', error);
        alert('Erreur lors de l\'export des produits');
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return this.authService.hasRole(permission.split(',')[0]) || permission.split(',').some(role => this.authService.hasRole(role));
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Actif': return 'badge bg-success';
      case 'Inactif': return 'badge bg-danger';
      case 'Discontinué': return 'badge bg-warning text-dark';
      case 'Rupture': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(value);
  }

  trackByProductId(index: number, product: ProductResponse): number {
    return product.id;
  }
}