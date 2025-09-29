import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { 
  PurchaseOrderResponse, 
  PurchaseOrderListResponse, 
  PurchaseApiResponse
} from '../../../models/purchase.models';

@Component({
  selector: 'app-goods-receipt-list',
  templateUrl: './goods-receipt-list.component.html',
  styleUrls: ['./goods-receipt-list.component.css']
})
export class GoodsReceiptListComponent implements OnInit {
  purchaseOrders: PurchaseOrderResponse[] = [];
  loading = false;
  error: string | null = null;
  page: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  searchTerm: string = '';

  constructor(
    private purchaseService: PurchaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUnreceivedOrders();
  }

  loadUnreceivedOrders(): void {
    this.loading = true;
    this.error = null;

    // Ensure page and pageSize are valid numbers
    const page = Math.max(1, this.page || 1);
    const pageSize = Math.max(1, this.pageSize || 10);

    this.purchaseService.getAllPurchaseOrders(page, pageSize).subscribe({
      next: (response: PurchaseApiResponse<PurchaseOrderListResponse>) => {
        try {
          if (response.success && response.data) {
            // Filter for unreceived orders (Envoyée or Partielle status)
            const unreceivedOrders = response.data.commandes.filter(order => {
              const status = order.statut?.toLowerCase().trim();
              return status === 'envoyée' || status === 'partielle' || 
                     status === 'envoyee' || status === 'partiel' ||
                     status === 'envoyé' || status === 'partiél';
            });
            
            this.purchaseOrders = unreceivedOrders;
            this.totalCount = response.data.totalCount;
          } else {
            this.error = response.message || 'Failed to load purchase orders';
          }
        } catch (e: any) {
          console.error('Error processing response:', e);
          this.error = 'Error processing purchase orders data: ' + (e.message || e);
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('API Error:', err);
        if (err.status === 401) {
          this.error = 'Authentication required. Please log in.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Insufficient permissions.';
        } else if (err.status === 400) {
          this.error = 'Invalid request parameters. Please check your inputs.';
        } else if (err.status === 0) {
          this.error = 'Unable to connect to server. Please check your connection.';
        } else {
          this.error = `Error loading purchase orders: ${err.message || 'Unknown error'}`;
        }
        this.loading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    this.page = Math.max(1, newPage || 1);
    this.loadUnreceivedOrders();
  }

  onSearch(): void {
    this.page = 1;
    this.loadUnreceivedOrders();
  }

  receiveGoods(orderId: number): void {
    this.router.navigate(['/purchase-orders', orderId, 'receive']);
  }

  getStatusClass(status: string): string {
    if (!status) return 'badge bg-secondary';
    
    switch (status.toLowerCase()) {
      case 'brouillon':
        return 'badge bg-secondary';
      case 'envoyée':
      case 'envoyee':
      case 'envoyé':
        return 'badge bg-primary';
      case 'partielle':
      case 'partiel':
      case 'partiél':
        return 'badge bg-warning';
      case 'livrée':
      case 'livree':
      case 'livré':
        return 'badge bg-success';
      case 'annulée':
      case 'annulee':
      case 'annulé':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }
}