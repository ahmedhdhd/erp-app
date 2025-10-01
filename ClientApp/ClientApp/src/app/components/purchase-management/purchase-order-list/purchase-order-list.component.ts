import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { PurchaseOrderResponse, PurchaseOrderListResponse, PurchaseOrderSearchRequest, PurchaseApiResponse } from '../../../models/purchase.models';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.css']
})
export class PurchaseOrderListComponent implements OnInit {
  purchaseOrders: PurchaseOrderResponse[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Search properties
  searchTerm = '';
  showAdvancedSearch = false;
  searchRequest: PurchaseOrderSearchRequest = {
    fournisseurId: null,
    statut: null,
    dateDebut: null,
    dateFin: null,
    page: 1,
    pageSize: 10,
    sortBy: 'dateCommande',
    sortDirection: 'desc'
  };

  // For dropdown options
  statusOptions = [
    { value: null, label: 'Tous les statuts' },
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Envoyée', label: 'Envoyée' },
    { value: 'Partielle', label: 'Partielle' },
    { value: 'Livrée', label: 'Livrée' },
    { value: 'Annulée', label: 'Annulée' }
  ];

  constructor(
    private purchaseService: PurchaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    this.loading = true;
    this.error = null;

    // Update search request with current page and page size
    this.searchRequest.page = this.page;
    this.searchRequest.pageSize = this.pageSize;

    this.purchaseService.searchPurchaseOrders(this.searchRequest).subscribe({
      next: (response: PurchaseApiResponse<PurchaseOrderListResponse>) => {
        if (response.success && response.data) {
          this.purchaseOrders = response.data.commandes;
          this.totalCount = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          this.error = response.message || 'Failed to load purchase orders';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'An error occurred while loading purchase orders';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadPurchaseOrders();
  }

  onPageSizeChange(event: any): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value);
    this.page = 1;
    this.loadPurchaseOrders();
  }

  viewPurchaseOrder(id: number): void {
    this.router.navigate(['/purchase-orders', id]);
  }

  editPurchaseOrder(id: number): void {
    this.router.navigate(['/purchase-orders', id, 'edit']);
  }

  deletePurchaseOrder(id: number): void {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      this.purchaseService.deletePurchaseOrder(id).subscribe({
        next: (response: PurchaseApiResponse<void>) => {
          if (response.success) {
            this.loadPurchaseOrders(); // Reload the list
          } else {
            this.error = response.message || 'Failed to delete purchase order';
          }
        },
        error: (err) => {
          this.error = 'An error occurred while deleting the purchase order';
          console.error(err);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'brouillon':
        return 'badge bg-secondary';
      case 'envoyée':
        return 'badge bg-primary';
      case 'partielle':
        return 'badge bg-warning';
      case 'livrée':
        return 'badge bg-success';
      case 'annulée':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  // Search methods
  onSearch(): void {
    this.page = 1; // Reset to first page when searching
    this.loadPurchaseOrders();
  }

  onResetSearch(): void {
    // Reset search criteria
    this.searchTerm = '';
    this.searchRequest = {
      fournisseurId: null,
      statut: null,
      dateDebut: null,
      dateFin: null,
      page: 1,
      pageSize: 10,
      sortBy: 'dateCommande',
      sortDirection: 'desc'
    };
    this.page = 1;
    this.loadPurchaseOrders();
  }

  onDateDebutChange(event: any): void {
    const target = event.target as HTMLInputElement;
    this.searchRequest.dateDebut = target.value ? new Date(target.value) : null;
  }

  onDateFinChange(event: any): void {
    const target = event.target as HTMLInputElement;
    this.searchRequest.dateFin = target.value ? new Date(target.value) : null;
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
}