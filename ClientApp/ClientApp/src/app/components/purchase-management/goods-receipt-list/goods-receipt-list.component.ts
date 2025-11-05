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
    // Ensure proper initialization
    this.page = Math.max(1, Number(this.page) || 1);
    this.pageSize = Math.max(1, Number(this.pageSize) || 10);
    setTimeout(() => {
      this.loadUnreceivedOrders();
    }, 100);
  }

  loadAllPurchaseOrders(): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getAllPurchaseOrders(this.page, this.pageSize).subscribe({
      next: (response: PurchaseApiResponse<PurchaseOrderListResponse>) => {
        try {
          console.log('Full API response:', response);
          if (response.success && response.data) {
            // Display all orders for debugging
            this.purchaseOrders = response.data.commandes;
            this.totalCount = response.data.totalCount;
            console.log('All purchase orders loaded:', response.data.commandes);
            
            // Log the status of each order for debugging
            response.data.commandes.forEach(order => {
              console.log(`Order ${order.id}: status = "${order.statut}"`);
            });
          } else {
            this.error = response.message || 'Failed to load purchase orders';
          }
        } catch (e: any) {
          console.error('Error processing response:', e);
          this.error = 'Error processing purchase orders data: ' + (e.message || 'Unknown error');
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('API Error:', err);
        // Log detailed error information
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url
        });
        
        if (err.status === 401) {
          this.error = 'Authentication required. Please log in.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Insufficient permissions.';
        } else if (err.status === 400) {
          this.error = 'Invalid request parameters. Please check your inputs.';
        } else if (err.status === 0) {
          this.error = 'Unable to connect to server. Please check your connection.';
        } else if (err.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = `Error loading purchase orders: ${err.message || 'Unknown error'}`;
        }
        this.loading = false;
      }
    });
  }

  loadUnreceivedOrders(): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getAllPurchaseOrders(this.page, this.pageSize).subscribe({
      next: (response: PurchaseApiResponse<PurchaseOrderListResponse>) => {
        try {
          console.log('Full API response for unreceived orders:', response);
          
          // Check if response exists and has the expected structure
          if (!response) {
            this.error = 'No response received from server';
            this.loading = false;
            return;
          }
          
          if (response.success && response.data) {
            console.log('Received data with', response.data.commandes.length, 'orders');
            
            // First, let's log all orders to see what we're working with
            console.log('All orders before filtering:');
            if (response.data.commandes && Array.isArray(response.data.commandes)) {
              response.data.commandes.forEach((order, index) => {
                console.log(`Order ${index}:`, order);
                if (order) {
                  console.log(`Order ${order.id}: status = "${order.statut}" (type: ${typeof order.statut})`);
                } else {
                  console.log(`Order at index ${index} is null or undefined`);
                }
              });
            } else {
              console.log('Commandes is not an array or is undefined:', response.data.commandes);
            }
            
            // Filter for unreceived orders (Envoyée or Partielle status)
            let unreceivedOrders: PurchaseOrderResponse[] = [];
            if (response.data.commandes && Array.isArray(response.data.commandes)) {
              unreceivedOrders = response.data.commandes.filter(order => {
                if (!order) {
                  console.log('Found null order in array');
                  return false;
                }
                
                if (!order.statut) {
                  console.log(`Order ${order.id}: null or missing status`);
                  return false;
                }
                
                // Normalize the status string for comparison
                const status = order.statut.toString().toLowerCase().trim();
                console.log(`Order ${order.id}: status = "${order.statut}" (normalized: "${status}")`);
                
                // Check for various forms of "Envoyée" and "Partielle" using more flexible matching
                const isUnreceived = (
                  status.includes('envoy') || 
                  status.includes('partiel') ||
                  status === 'envoyée' || 
                  status === 'envoyee' || 
                  status === 'envoyé' ||
                  status === 'partielle' || 
                  status === 'partiel' ||
                  status === 'partiél'
                );
                
                console.log(`Order ${order.id}: isUnreceived = ${isUnreceived}`);
                return isUnreceived;
              });
            }
            
            this.purchaseOrders = unreceivedOrders;
            this.totalCount = response.data.totalCount || 0;
            console.log('Filtered unreceived orders count:', this.purchaseOrders.length);
            console.log('Filtered unreceived orders:', this.purchaseOrders);
            
            // If we have no orders after filtering, show all orders for debugging
            if (this.purchaseOrders.length === 0 && response.data.commandes && Array.isArray(response.data.commandes)) {
              console.log('No unreceived orders found, showing all orders for debugging');
              this.purchaseOrders = response.data.commandes.slice(0, 10); // Show first 10 for debugging
            }
          } else {
            this.error = response.message || 'Failed to load purchase orders';
            console.error('API response indicates failure:', response.message);
          }
        } catch (e: any) {
          console.error('Error processing response:', e);
          this.error = 'Error processing purchase orders data: ' + (e.message || 'Unknown error');
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('API Error:', err);
        // Log detailed error information
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url
        });
        
        if (err.status === 401) {
          this.error = 'Authentication required. Please log in.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Insufficient permissions.';
        } else if (err.status === 400) {
          this.error = 'Invalid request parameters. Please check your inputs.';
        } else if (err.status === 0) {
          this.error = 'Unable to connect to server. Please check your connection.';
        } else if (err.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = `Error loading purchase orders: ${err.message || 'Unknown error'}`;
        }
        this.loading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    this.page = Math.max(1, Number(newPage) || 1);
    this.loadUnreceivedOrders();
  }

  onSearch(): void {
    this.page = 1;
    this.loadUnreceivedOrders();
  }

  receiveGoods(orderId: number | undefined): void {
    // Validate that orderId is a valid number before navigation
    if (orderId && !isNaN(orderId) && orderId > 0) {
      this.router.navigate(['/purchase-orders', orderId, 'receive']);
    } else {
      console.error('Invalid order ID:', orderId);
      this.error = 'Invalid order ID. Cannot navigate to goods receipt.';
    }
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
        // Try to match with partial strings
        if (status.toLowerCase().includes('envoy')) {
          return 'badge bg-primary';
        } else if (status.toLowerCase().includes('partiel')) {
          return 'badge bg-warning';
        } else if (status.toLowerCase().includes('livr')) {
          return 'badge bg-success';
        } else if (status.toLowerCase().includes('annul')) {
          return 'badge bg-danger';
        } else {
          return 'badge bg-secondary';
        }
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    // Handle different date formats
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('fr-FR');
    } catch (e) {
      return 'N/A';
    }
  }

  formatCurrency(amount: number): string {
    if (isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(amount);
  }

  getTotalPages(): number {
    const pages = Math.ceil(this.totalCount / this.pageSize) || 1;
    return pages;
  }

  isValidOrderId(id: number | undefined): boolean {
    return id !== undefined && id !== null && !isNaN(id) && id > 0;
  }
}