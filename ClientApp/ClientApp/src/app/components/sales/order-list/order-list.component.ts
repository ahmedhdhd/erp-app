import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SalesService } from '../../../services/sales.service';
import { InvoiceService } from '../../../services/invoice.service';
import { ClientService } from '../../../services/client.service';
import { SalesOrderResponse, SalesApiResponse, SalesOrderListResponse, CompanySettingsResponse } from '../../../models/sales.models';
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
  companySettings: CompanySettingsResponse | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  
  // Loading and error states
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Selection
  selectedOrderIds: number[] = [];
  selectAll = false;
  
  // Search
  showAdvancedSearch = false;
  searchForm = {
    clientId: null as number | null,
    statut: '',
    dateDebut: null as string | null,
    dateFin: null as string | null,
    sortBy: 'dateCommande',
    sortDirection: 'desc'
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
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadClients();
    this.loadCompanySettings();
  }

  // Load orders with pagination and filtering
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.salesService.getAllSalesOrders(
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response: SalesApiResponse<SalesOrderListResponse>) => {
        if (response.success && response.data) {
          this.orders = response.data.commandes;
          this.totalCount = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des commandes';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  // Load clients for dropdown
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

  // Load company settings
  loadCompanySettings(): void {
    this.salesService.getCompanySettings().subscribe({
      next: (response: SalesApiResponse<CompanySettingsResponse>) => {
        if (response.success && response.data) {
          this.companySettings = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading company settings:', error);
      }
    });
  }

  // Navigation
  createOrder(): void {
    this.router.navigate(['/sales/orders/new']);
  }

  viewOrder(id: number): void {
    this.router.navigate(['/sales/orders', id]);
  }

  editOrder(id: number): void {
    this.router.navigate(['/sales/orders/edit', id]);
  }

  // Print invoice
  printInvoice(id: number): void {
    // First, load the order details to get real data
    this.salesService.getSalesOrder(id).subscribe({
      next: (response: SalesApiResponse<SalesOrderResponse>) => {
        if (response.success && response.data) {
          try {
            this.invoiceService.generateSalesOrderInvoice(response.data, this.companySettings);
          } catch (error) {
            console.error('Error generating invoice:', error);
            alert('Error generating invoice. Please check the console for details.');
          }
        } else {
          alert('Erreur lors du chargement de la commande pour l\'impression');
        }
      },
      error: (error: any) => {
        console.error('Error loading order for print:', error);
        alert('Erreur de connexion au serveur');
      }
    });
  }

  // Order actions
  submitOrder(order: SalesOrderResponse): void {
    if (confirm(`Soumettre la commande #${order.id} ?`)) {
      this.salesService.submitSalesOrder(order.id).subscribe({
        next: (response: SalesApiResponse<SalesOrderResponse>) => {
          if (response.success) {
            this.successMessage = 'Commande soumise avec succès';
            // Reload the orders to reflect the status change
            this.loadOrders();
          } else {
            this.errorMessage = response.message || 'Erreur lors de la soumission de la commande';
          }
        },
        error: (error: any) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          console.error('Error submitting order:', error);
        }
      });
    }
  }

  deleteOrder(order: SalesOrderResponse): void {
    if (confirm(`Supprimer la commande #${order.id} ? Cette action est irréversible.`)) {
      this.salesService.deleteSalesOrder(order.id).subscribe({
        next: (response: SalesApiResponse<void>) => {
          if (response.success) {
            this.successMessage = 'Commande supprimée avec succès';
            // Reload the orders to reflect the deletion
            this.loadOrders();
            // Remove from selection if it was selected
            this.selectedOrderIds = this.selectedOrderIds.filter(oid => oid !== order.id);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la suppression de la commande';
          }
        },
        error: (error: any) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          console.error('Error deleting order:', error);
        }
      });
    }
  }

  // Selection
  toggleSelectOrder(id: number): void {
    const index = this.selectedOrderIds.indexOf(id);
    if (index > -1) {
      this.selectedOrderIds.splice(index, 1);
    } else {
      this.selectedOrderIds.push(id);
    }
    this.selectAll = this.selectedOrderIds.length === this.orders.length;
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedOrderIds = this.orders.map(order => order.id);
    } else {
      this.selectedOrderIds = [];
    }
  }

  isOrderSelected(id: number): boolean {
    return this.selectedOrderIds.includes(id);
  }

  // Permissions
  canCreateOrder(): boolean {
    // TODO: Implement actual permission check
    return true;
  }

  canEditOrder(): boolean {
    // TODO: Implement actual permission check
    return true;
  }

  // Search
  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onAdvancedSearch(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

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

  // Pagination
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadOrders();
  }

  // Sorting
  sortBy(field: string): void {
    if (this.searchForm.sortBy === field) {
      // Toggle sort direction
      this.searchForm.sortDirection = this.searchForm.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field
      this.searchForm.sortBy = field;
      this.searchForm.sortDirection = 'asc';
    }
    this.loadOrders();
  }

  getSortIcon(field: string): string {
    if (this.searchForm.sortBy === field) {
      return this.searchForm.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    return 'fas fa-sort';
  }

  // Formatting
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(amount);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Brouillon': return 'bg-secondary';
      case 'Confirmé': return 'bg-primary';
      case 'Expédié': return 'bg-info';
      case 'Livré': return 'bg-success';
      case 'Annulé': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // Utility
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i + 1);
  }
}