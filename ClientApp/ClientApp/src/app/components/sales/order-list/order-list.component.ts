import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SalesService } from '../../../services/sales.service';
import { ClientService } from '../../../services/client.service';
import { SalesOrderResponse, SalesOrderListResponse, SalesOrderSearchRequest, SalesApiResponse } from '../../../models/sales.models';
import { ClientResponse, ClientApiResponse, ClientListResponse } from '../../../models/client.models';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  // Data
  orders: SalesOrderResponse[] = [];
  clients: ClientResponse[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  // Loading and error states
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Selection
  selectedOrderIds: number[] = [];
  selectAll = false;

  // Search and filter
  showAdvancedSearch = false;
  searchForm = {
    clientId: null as number | null,
    statut: '',
    dateDebut: null as Date | null,
    dateFin: null as Date | null,
    sortBy: 'dateCommande',
    sortDirection: 'desc' as 'asc' | 'desc'
  };

  // Status options
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Confirmé', label: 'Confirmé' },
    { value: 'Expédié', label: 'Expédié' },
    { value: 'Livré', label: 'Livré' },
    { value: 'Annulé', label: 'Annulé' }
  ];

  constructor(
    private salesService: SalesService,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadClients();
  }

  // Load orders
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.salesService.getAllSalesOrders(this.currentPage, this.pageSize).subscribe({
      next: (response: SalesApiResponse<SalesOrderListResponse>) => {
        if (response.success && response.data) {
          this.orders = response.data.commandes;
          this.totalCount = response.data.totalCount;
          this.currentPage = response.data.page;
          this.pageSize = response.data.pageSize;
          this.totalPages = response.data.totalPages;
          this.hasNextPage = response.data.hasNextPage;
          this.hasPreviousPage = response.data.hasPreviousPage;
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des commandes';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  // Load clients for search dropdown
  loadClients(): void {
    this.clientService.getClients(1, 1000).subscribe({
      next: (response: ClientApiResponse<ClientListResponse>) => {
        if (response.success && response.data) {
          this.clients = response.data.clients;
        }
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  // Search
  onSearch(): void {
    this.currentPage = 1;
    this.performSearch();
  }

  // Advanced search
  onAdvancedSearch(): void {
    this.currentPage = 1;
    this.performSearch();
  }

  // Perform search with current filters
  performSearch(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const searchRequest: SalesOrderSearchRequest = {
      clientId: this.searchForm.clientId,
      statut: this.searchForm.statut || undefined,
      dateDebut: this.searchForm.dateDebut || undefined,
      dateFin: this.searchForm.dateFin || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.searchForm.sortBy,
      sortDirection: this.searchForm.sortDirection
    };

    this.salesService.searchSalesOrders(searchRequest).subscribe({
      next: (response: SalesApiResponse<SalesOrderListResponse>) => {
        if (response.success && response.data) {
          this.orders = response.data.commandes;
          this.totalCount = response.data.totalCount;
          this.currentPage = response.data.page;
          this.pageSize = response.data.pageSize;
          this.totalPages = response.data.totalPages;
          this.hasNextPage = response.data.hasNextPage;
          this.hasPreviousPage = response.data.hasPreviousPage;
        } else {
          this.errorMessage = response.message || 'Erreur lors de la recherche des commandes';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error searching orders:', error);
      }
    });
  }

  // Pagination
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOrders();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadOrders();
  }

  // Sorting
  sortBy(field: string): void {
    if (this.searchForm.sortBy === field) {
      this.searchForm.sortDirection = this.searchForm.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.searchForm.sortBy = field;
      this.searchForm.sortDirection = 'asc';
    }
    this.loadOrders();
  }

  getSortIcon(field: string): string {
    if (this.searchForm.sortBy !== field) {
      return 'fas fa-sort';
    }
    return this.searchForm.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  // Selection
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.selectedOrderIds = this.selectAll 
      ? this.orders.map(order => order.id) 
      : [];
  }

  toggleSelectOrder(orderId: number): void {
    const index = this.selectedOrderIds.indexOf(orderId);
    if (index > -1) {
      this.selectedOrderIds.splice(index, 1);
    } else {
      this.selectedOrderIds.push(orderId);
    }
    this.selectAll = this.selectedOrderIds.length === this.orders.length;
  }

  isOrderSelected(orderId: number): boolean {
    return this.selectedOrderIds.includes(orderId);
  }

  // Actions
  viewOrder(id: number): void {
    this.router.navigate(['/sales/orders', id]);
  }

  editOrder(id: number): void {
    this.router.navigate(['/sales/orders/edit', id]);
  }

  createOrder(): void {
    this.router.navigate(['/sales/orders/new']);
  }

  deleteOrder(order: SalesOrderResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande #${order.id} ?`)) {
      this.salesService.deleteSalesOrder(order.id).subscribe({
        next: (response: SalesApiResponse<void>) => {
          if (response.success) {
            this.successMessage = 'Commande supprimée avec succès';
            this.loadOrders(); // Reload the list
            setTimeout(() => this.successMessage = null, 3000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la suppression de la commande';
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          console.error('Error deleting order:', error);
        }
      });
    }
  }

  // Submit order
  submitOrder(order: SalesOrderResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir soumettre la commande #${order.id} ?`)) {
      this.salesService.submitSalesOrder(order.id).subscribe({
        next: (response: SalesApiResponse<SalesOrderResponse>) => {
          if (response.success && response.data) {
            this.successMessage = 'Commande soumise avec succès';
            // Update the order in the list
            const index = this.orders.findIndex(o => o.id === order.id);
            if (index > -1) {
              this.orders[index] = response.data!;
            }
            setTimeout(() => this.successMessage = null, 3000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la soumission de la commande';
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          console.error('Error submitting order:', error);
        }
      });
    }
  }

  // UI helpers
  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'Brouillon':
        return 'bg-secondary';
      case 'Confirmé':
        return 'bg-primary';
      case 'Expédié':
        return 'bg-info';
      case 'Livré':
        return 'bg-success';
      case 'Annulé':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-TN');
  }

  // Helper function for template to get min value
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Helper function for template to create array
  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i + 1);
  }

  // Clear search
  clearSearch(): void {
    this.searchForm = {
      clientId: null,
      statut: '',
      dateDebut: null,
      dateFin: null,
      sortBy: 'dateCommande',
      sortDirection: 'desc'
    };
    this.currentPage = 1;
    this.loadOrders();
  }

  // Toggle advanced search
  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  // Check permissions
  canCreateOrder(): boolean {
    // In a real application, you would check user roles/permissions
    return true;
  }

  canEditOrder(): boolean {
    // In a real application, you would check user roles/permissions
    return true;
  }

  canDeleteOrder(): boolean {
    // In a real application, you would check user roles/permissions
    return true;
  }
}