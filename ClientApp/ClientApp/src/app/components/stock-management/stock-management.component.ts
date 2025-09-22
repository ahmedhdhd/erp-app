import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import {
  ProductResponse,
  StockMovementResponse,
  StockAdjustmentRequest,
  ProductApiResponse,
  VariantResponse,
  StockMovementType
} from '../../models/product.models';

@Component({
  selector: 'app-stock-management',
  templateUrl: './stock-management.component.html',
  styleUrls: ['./stock-management.component.css']
})
export class StockManagementComponent implements OnInit {
  // Form and data
  adjustmentForm: FormGroup;
  products: ProductResponse[] = [];
  selectedProduct: ProductResponse | null = null;
  variants: VariantResponse[] = [];
  stockMovements: StockMovementResponse[] = [];
  
  // Filters and search
  searchTerm = '';
  selectedCategory = '';
  stockFilter = 'all'; // all, low, out-of-stock
  
  // UI State
  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  
  // Modal state
  showAdjustmentModal = false;
  selectedVariantId: number | null = null;

  // Constants
  movementTypes = Object.values(StockMovementType);
  stockFilterOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'low', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
    { value: 'adequate', label: 'Adequate Stock' }
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService
  ) {
    this.adjustmentForm = this.createAdjustmentForm();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  createAdjustmentForm(): FormGroup {
    return this.fb.group({
      productId: [null, [Validators.required]],
      variantId: [null],
      currentStock: [{ value: 0, disabled: true }],
      newQuantity: [0, [Validators.required, Validators.min(0)]],
      reason: ['', [Validators.required, Validators.minLength(5)]],
      reference: ['', [Validators.required]],
      emplacement: ['Main Warehouse', [Validators.required]]
    });
  }

  // ==================== DATA LOADING ====================

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    const searchRequest = {
      searchTerm: this.searchTerm,
      stockFaible: this.stockFilter === 'low',
      ruptureStock: this.stockFilter === 'out-of-stock',
      sortBy: 'designation',
      sortDirection: 'asc',
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.productService.searchProducts(searchRequest).subscribe({
      next: (response: ProductApiResponse<{ products: ProductResponse[], totalCount: number }>) => {
        if (response.success && response.data) {
          this.products = response.data.products;
          this.totalItems = response.data.totalCount;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  loadProductVariants(productId: number): void {
    this.productService.getProductVariants(productId).subscribe({
      next: (response: ProductApiResponse<VariantResponse[]>) => {
        if (response.success && response.data) {
          this.variants = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading variants:', error);
      }
    });
  }

  loadStockMovements(productId: number, variantId?: number): void {
    this.productService.getStockMovements(productId, variantId).subscribe({
      next: (response: ProductApiResponse<StockMovementResponse[]>) => {
        if (response.success && response.data) {
          this.stockMovements = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading stock movements:', error);
      }
    });
  }

  // ==================== SEARCH AND FILTERING ====================

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  // ==================== STOCK ADJUSTMENT ====================

  openAdjustmentModal(product: ProductResponse, variantId?: number): void {
    this.selectedProduct = product;
    this.selectedVariantId = variantId || null;
    
    // Load variants if product has them
    if (product.variantes.length > 0) {
      this.loadProductVariants(product.id);
    }
    
    // Load stock movements
    this.loadStockMovements(product.id, variantId);
    
    // Set form values
    const currentStock = variantId 
      ? product.variantes.find(v => v.id === variantId)?.stockActuel || 0
      : product.stockActuel;
    
    this.adjustmentForm.patchValue({
      productId: product.id,
      variantId: variantId || null,
      currentStock: currentStock,
      newQuantity: currentStock,
      reason: '',
      reference: this.generateReference(),
      emplacement: 'Main Warehouse'
    });
    
    this.showAdjustmentModal = true;
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal = false;
    this.selectedProduct = null;
    this.selectedVariantId = null;
    this.variants = [];
    this.stockMovements = [];
    this.adjustmentForm.reset();
    this.success = null;
    this.error = null;
  }

  submitAdjustment(): void {
    if (this.adjustmentForm.invalid) {
      this.markFormGroupTouched(this.adjustmentForm);
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.adjustmentForm.value;
    const adjustmentRequest: StockAdjustmentRequest = {
      productId: formValue.productId,
      newQuantity: formValue.newQuantity,
      reason: formValue.reason,
      reference: formValue.reference,
      emplacement: formValue.emplacement
    };

    this.productService.createStockAdjustment(adjustmentRequest).subscribe({
      next: (response: ProductApiResponse<StockMovementResponse>) => {
        if (response.success) {
          this.success = 'Stock adjustment completed successfully';
          this.loadProducts(); // Refresh products list
          this.loadStockMovements(formValue.productId, formValue.variantId);
          
          // Update current stock display
          this.adjustmentForm.patchValue({
            currentStock: formValue.newQuantity
          });
        } else {
          this.error = response.message || 'Failed to adjust stock';
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Error adjusting stock:', error);
        this.error = error.message || 'Failed to adjust stock';
        this.saving = false;
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  generateReference(): string {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `ADJ-${timestamp}`;
  }

  getStockStatusClass(product: ProductResponse): string {
    if (product.estRuptureStock) {
      return 'text-danger';
    } else if (product.estStockFaible) {
      return 'text-warning';
    }
    return 'text-success';
  }

  getStockStatusText(product: ProductResponse): string {
    if (product.estRuptureStock) {
      return 'Out of Stock';
    } else if (product.estStockFaible) {
      return 'Low Stock';
    }
    return 'In Stock';
  }

  getStockStatusBadgeClass(product: ProductResponse): string {
    if (product.estRuptureStock) {
      return 'badge bg-danger';
    } else if (product.estStockFaible) {
      return 'badge bg-warning';
    }
    return 'badge bg-success';
  }

  getMovementTypeClass(type: string): string {
    switch (type) {
      case StockMovementType.ENTREE:
      case StockMovementType.AJUSTEMENT_PLUS:
        return 'text-success';
      case StockMovementType.SORTIE:
      case StockMovementType.AJUSTEMENT_MOINS:
        return 'text-danger';
      default:
        return 'text-info';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  canManageStock(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('Inventaire');
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.adjustmentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.adjustmentForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName} must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  refreshData(): void {
    this.loadProducts();
  }
}