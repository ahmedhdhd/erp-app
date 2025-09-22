import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  ProductResponse,
  ProductApiResponse,
  StockMovementResponse,
  VariantResponse
} from '../../../models/product.models';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: ProductResponse | null = null;
  stockMovements: StockMovementResponse[] = [];
  loading = false;
  stockMovementsLoading = false;
  productId!: number;
  errorMessage = ''; // Add this property

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.loadProduct();
        this.loadStockMovements();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(): void {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (response: ProductApiResponse<ProductResponse>) => {
        if (response.success && response.data) {
          this.product = response.data;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Error loading product details';
        this.loading = false;
      }
    });
  }

  private loadStockMovements(): void {
    this.stockMovementsLoading = true;
    this.productService.getStockMovements(this.productId).subscribe({
      next: (response: ProductApiResponse<StockMovementResponse[]>) => {
        if (response.success && response.data) {
          this.stockMovements = response.data;
        }
        this.stockMovementsLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading stock movements:', error);
        this.stockMovementsLoading = false;
      }
    });
  }

  editProduct(): void {
    this.router.navigate(['/products', this.productId, 'edit']);
  }

  deleteProduct(): void {
    if (!this.product || !confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.productService.deleteProduct(this.productId).subscribe({
      next: (response: ProductApiResponse<any>) => {
        if (response.success) {
          alert('Product deleted successfully');
          this.router.navigate(['/products']);
        }
      },
      error: (error: any) => {
        console.error('Error deleting product:', error);
        this.errorMessage = 'Error deleting product';
        alert('Error deleting product');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  // Add the missing methods
  onPrint(): void {
    window.print();
  }

  clearError(): void {
    this.errorMessage = '';
  }

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return permission.split(',').some(role => this.authService.hasRole(role.trim()));
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Actif': return 'badge bg-success';
      case 'Inactif': return 'badge bg-danger';
      case 'Discontinué': return 'badge bg-warning text-dark';
      case 'Rupture': return 'badge bg-dark';
      default: return 'badge bg-secondary';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }
}