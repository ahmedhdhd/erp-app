import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SalesService } from '../../../services/sales.service';
import { QuoteResponse, QuoteListResponse, QuoteSearchRequest, SalesApiResponse } from '../../../models/sales.models';
import { ClientService } from '../../../services/client.service';
import { ClientResponse, ClientApiResponse, ClientListResponse } from '../../../models/client.models';

@Component({
  selector: 'app-quote-list',
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent implements OnInit {
  // Data
  quotes: QuoteResponse[] = [];
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
  selectedQuoteIds: number[] = [];
  selectAll = false;

  // Search and filter
  showAdvancedSearch = false;
  searchForm = {
    searchTerm: '',
    clientId: null as number | null,
    statut: '',
    dateDebut: null as Date | null,
    dateFin: null as Date | null,
    sortBy: 'dateCreation',
    sortDirection: 'desc' as 'asc' | 'desc'
  };

  // Status options
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Envoyé', label: 'Envoyé' },
    { value: 'Accepté', label: 'Accepté' },
    { value: 'Rejeté', label: 'Rejeté' }
  ];

  constructor(
    private salesService: SalesService,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuotes();
    this.loadClients();
  }

  // Load quotes
  loadQuotes(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.salesService.getAllQuotes(this.currentPage, this.pageSize).subscribe({
      next: (response: SalesApiResponse<QuoteListResponse>) => {
        if (response.success && response.data) {
          this.quotes = response.data.devis;
          this.totalCount = response.data.totalCount;
          this.currentPage = response.data.page;
          this.pageSize = response.data.pageSize;
          this.totalPages = response.data.totalPages;
          this.hasNextPage = response.data.hasNextPage;
          this.hasPreviousPage = response.data.hasPreviousPage;
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des devis';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error loading quotes:', error);
      }
    });
  }

  // Load clients for search dropdown
  loadClients(): void {
    // For simplicity, we're loading all clients
    // In a real application, you might want to implement pagination
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

    const searchRequest: QuoteSearchRequest = {
      clientId: this.searchForm.clientId,
      statut: this.searchForm.statut || undefined,
      dateDebut: this.searchForm.dateDebut || undefined,
      dateFin: this.searchForm.dateFin || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.searchForm.sortBy,
      sortDirection: this.searchForm.sortDirection
    };

    this.salesService.searchQuotes(searchRequest).subscribe({
      next: (response: SalesApiResponse<QuoteListResponse>) => {
        if (response.success && response.data) {
          this.quotes = response.data.devis;
          this.totalCount = response.data.totalCount;
          this.currentPage = response.data.page;
          this.pageSize = response.data.pageSize;
          this.totalPages = response.data.totalPages;
          this.hasNextPage = response.data.hasNextPage;
          this.hasPreviousPage = response.data.hasPreviousPage;
        } else {
          this.errorMessage = response.message || 'Erreur lors de la recherche des devis';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error searching quotes:', error);
      }
    });
  }

  // Pagination
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadQuotes();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadQuotes();
  }

  // Sorting
  sortBy(field: string): void {
    if (this.searchForm.sortBy === field) {
      this.searchForm.sortDirection = this.searchForm.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.searchForm.sortBy = field;
      this.searchForm.sortDirection = 'asc';
    }
    this.loadQuotes();
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
    this.selectedQuoteIds = this.selectAll 
      ? this.quotes.map(quote => quote.id) 
      : [];
  }

  toggleSelectQuote(quoteId: number): void {
    const index = this.selectedQuoteIds.indexOf(quoteId);
    if (index > -1) {
      this.selectedQuoteIds.splice(index, 1);
    } else {
      this.selectedQuoteIds.push(quoteId);
    }
    this.selectAll = this.selectedQuoteIds.length === this.quotes.length;
  }

  isQuoteSelected(quoteId: number): boolean {
    return this.selectedQuoteIds.includes(quoteId);
  }

  // Actions
  viewQuote(id: number): void {
    this.router.navigate(['/sales/quotes', id]);
  }

  editQuote(id: number): void {
    this.router.navigate(['/sales/quotes/edit', id]);
  }

  createQuote(): void {
    this.router.navigate(['/sales/quotes/new']);
  }

  deleteQuote(quote: QuoteResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le devis #${quote.id} ?`)) {
      this.salesService.deleteQuote(quote.id).subscribe({
        next: (response: SalesApiResponse<void>) => {
          if (response.success) {
            this.successMessage = 'Devis supprimé avec succès';
            this.loadQuotes(); // Reload the list
            setTimeout(() => this.successMessage = null, 3000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la suppression du devis';
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          console.error('Error deleting quote:', error);
        }
      });
    }
  }

  // Submit quote
  submitQuote(quote: QuoteResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir soumettre le devis #${quote.id} ?`)) {
      this.salesService.submitQuote(quote.id).subscribe({
        next: (response: SalesApiResponse<QuoteResponse>) => {
          if (response.success && response.data) {
            this.successMessage = 'Devis soumis avec succès';
            // Update the quote in the list
            const index = this.quotes.findIndex(q => q.id === quote.id);
            if (index > -1) {
              this.quotes[index] = response.data!;
            }
            setTimeout(() => this.successMessage = null, 3000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la soumission du devis';
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          console.error('Error submitting quote:', error);
        }
      });
    }
  }

  // Accept quote
  acceptQuote(quote: QuoteResponse): void {
    if (confirm(`Êtes-vous sûr de vouloir accepter le devis #${quote.id} ?`)) {
      this.salesService.acceptQuote(quote.id).subscribe({
        next: (response: SalesApiResponse<QuoteResponse>) => {
          if (response.success && response.data) {
            this.successMessage = 'Devis accepté avec succès';
            // Update the quote in the list
            const index = this.quotes.findIndex(q => q.id === quote.id);
            if (index > -1) {
              this.quotes[index] = response.data!;
            }
            setTimeout(() => this.successMessage = null, 3000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de l\'acceptation du devis';
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          console.error('Error accepting quote:', error);
        }
      });
    }
  }

  // UI helpers
  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'Brouillon':
        return 'bg-secondary';
      case 'Envoyé':
        return 'bg-primary';
      case 'Accepté':
        return 'bg-success';
      case 'Rejeté':
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
      searchTerm: '',
      clientId: null,
      statut: '',
      dateDebut: null,
      dateFin: null,
      sortBy: 'dateCreation',
      sortDirection: 'desc'
    };
    this.currentPage = 1;
    this.loadQuotes();
  }

  // Toggle advanced search
  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  // Check permissions
  canCreateQuote(): boolean {
    // In a real application, you would check user roles/permissions
    return true;
  }

  canEditQuote(): boolean {
    // In a real application, you would check user roles/permissions
    return true;
  }

  canDeleteQuote(): boolean {
    // In a real application, you would check user roles/permissions
    return true;
  }
}