import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { ProductResponse, ProductStatsResponse, CategoryStatsResponse, ProductApiResponse, ProductListResponse } from '../../../models/product.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-statistics',
  templateUrl: './product-statistics.component.html',
  styleUrls: ['./product-statistics.component.css']
})
export class ProductStatisticsComponent implements OnInit {
  statistics: ProductStatsResponse = {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
    totalStockValue: 0,
    averagePrice: 0,
    averageMargin: 0,
    topCategories: [],
    lowStockAlerts: [],
    outOfStockAlerts: []
  };

  lowStockProducts: ProductResponse[] = [];
  outOfStockProducts: ProductResponse[] = [];
  topSellingProducts: ProductResponse[] = [];
  recentProducts: ProductResponse[] = [];

  loading = false;
  error: string | null = null;

  // Chart data
  stockChartData: any[] = [];
  categoryChartData: any[] = [];
  statusChartData: any[] = [];

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadLowStockProducts();
    this.loadOutOfStockProducts();
    this.loadRecentProducts();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductStats().subscribe({
      next: (response: ProductApiResponse<ProductStatsResponse>) => {
        if (response.success && response.data) {
          this.statistics = response.data;
          this.lowStockProducts = response.data.lowStockAlerts;
          this.outOfStockProducts = response.data.outOfStockAlerts;
          this.prepareChartData();
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading statistics:', error);
        this.error = 'Failed to load statistics';
        this.loading = false;
      }
    });
  }

  loadLowStockProducts(): void {
    this.productService.getLowStockProducts().subscribe({
      next: (response: ProductApiResponse<ProductResponse[]>) => {
        if (response.success && response.data) {
          this.lowStockProducts = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading low stock products:', error);
      }
    });
  }

  loadOutOfStockProducts(): void {
    this.productService.getOutOfStockProducts().subscribe({
      next: (response: ProductApiResponse<ProductResponse[]>) => {
        if (response.success && response.data) {
          this.outOfStockProducts = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading out of stock products:', error);
      }
    });
  }

  loadRecentProducts(): void {
    // Get recent products from the first page of products
    this.productService.getProducts(1, 5).subscribe({
      next: (response: ProductApiResponse<ProductListResponse>) => {
        if (response.success && response.data && response.data.products) {
          this.recentProducts = response.data.products;
        }
      },
      error: (error: any) => {
        console.error('Error loading recent products:', error);
      }
    });
  }

  prepareChartData(): void {
    // Stock status chart data
    this.stockChartData = [
      { name: 'In Stock', value: this.statistics.activeProducts - this.statistics.lowStockProducts - this.statistics.outOfStockProducts },
      { name: 'Low Stock', value: this.statistics.lowStockProducts },
      { name: 'Out of Stock', value: this.statistics.outOfStockProducts }
    ];

    // Product status chart data
    this.statusChartData = [
      { name: 'Active', value: this.statistics.activeProducts },
      { name: 'Inactive', value: this.statistics.inactiveProducts }
    ];

    // Category chart data
    this.categoryChartData = this.statistics.topCategories.map(cat => ({
      name: cat.nom,
      value: cat.nombreProduits
    }));
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  refreshStatistics(): void {
    this.loadStatistics();
    this.loadLowStockProducts();
    this.loadOutOfStockProducts();
    this.loadRecentProducts();
  }

  canManageProducts(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('Inventaire');
  }

  exportStatistics(): void {
    // Implementation for exporting statistics
    const data = {
      statistics: this.statistics,
      lowStockProducts: this.lowStockProducts,
      outOfStockProducts: this.outOfStockProducts,
      recentProducts: this.recentProducts,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `product-statistics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}