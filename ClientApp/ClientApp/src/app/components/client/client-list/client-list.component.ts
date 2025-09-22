import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { 
  ClientResponse, 
  ClientSearchRequest, 
  ClientApiResponse,
  ClientListResponse
} from '../../../models/client.models';
import { ClientService } from '../../../services/client.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit, OnDestroy {
  // Data
  clients: ClientResponse[] = [];
  filteredClients: ClientResponse[] = [];
  
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
  selectedClients: number[] = [];
  errorMessage = '';

  // Search and filters
  searchForm!: FormGroup;

  // Sorting
  sortField = 'Nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
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
      typeClient: [null],
      classification: [null],
      ville: [null],
      estActif: [null],
      creditMin: [null],
      creditMax: [null],
      sortBy: ['Nom'],
      sortDirection: ['asc']
    });
  }

  private loadInitialData(): void {
    this.loading = true;
    this.loadClients();
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
        this.loadClients();
      });
  }

  // ==================== DATA LOADING ====================

  loadClients(): void {
    this.loading = true;
    this.errorMessage = '';

    const searchRequest: ClientSearchRequest = this.buildSearchRequest();
    
    this.clientService.searchClients(searchRequest).subscribe({
      next: (response: ClientApiResponse<ClientListResponse>) => {
        this.loading = false;
        if (response.success && response.data) {
          this.clients = response.data.clients;
          this.filteredClients = [...this.clients];
          this.totalItems = response.data.totalCount;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des clients';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error.message || 'Erreur lors du chargement des clients';
        console.error('Error loading clients:', error);
      }
    });
  }

  private buildSearchRequest(): ClientSearchRequest {
    const formValue = this.searchForm.value;
    
    // Convert empty strings to null for proper API handling
    const creditMin = formValue.creditMin !== null && formValue.creditMin !== '' ? 
      Number(formValue.creditMin) : null;
    const creditMax = formValue.creditMax !== null && formValue.creditMax !== '' ? 
      Number(formValue.creditMax) : null;
    
    return {
      searchTerm: formValue.searchTerm || '',
      typeClient: formValue.typeClient || undefined,
      classification: formValue.classification || undefined,
      ville: formValue.ville || undefined,
      estActif: formValue.estActif,
      creditMin: creditMin,
      creditMax: creditMax,
      dateCreationFrom: null,
      dateCreationTo: null,
      sortBy: formValue.sortBy || 'Nom',
      sortDirection: formValue.sortDirection || 'asc',
      page: this.currentPage,
      pageSize: this.pageSize
    };
  }

  // ==================== SEARCH AND FILTERING ====================

  onSearch(): void {
    this.currentPage = 1;
    this.loadClients();
  }

  onAdvancedSearch(): void {
    this.currentPage = 1;
    this.loadClients();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadClients();
  }

  clearFilters(): void {
    this.searchForm.reset({
      searchTerm: '',
      typeClient: null,
      classification: null,
      ville: null,
      estActif: null,
      creditMin: null,
      creditMax: null,
      sortBy: 'Nom',
      sortDirection: 'asc'
    });
    this.currentPage = 1;
    this.loadClients();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // ==================== SORTING ====================

  sort(field: string): void {
    // Map frontend field names to backend property names
    const fieldMapping: { [key: string]: string } = {
      'nom': 'Nom',
      'prenom': 'Prenom',
      'raisonSociale': 'RaisonSociale',
      'typeClient': 'TypeClient',
      'ville': 'Ville',
      'limiteCredit': 'LimiteCredit',
      'estActif': 'EstActif',
      'dateCreation': 'DateCreation'
    };

    const backendField = fieldMapping[field] || field;

    if (this.sortField === backendField) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = backendField;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadClients();
  }

  getSortIcon(field: string): string {
    // Map frontend field names to backend property names
    const fieldMapping: { [key: string]: string } = {
      'nom': 'Nom',
      'prenom': 'Prenom',
      'raisonSociale': 'RaisonSociale',
      'typeClient': 'TypeClient',
      'ville': 'Ville',
      'limiteCredit': 'LimiteCredit',
      'estActif': 'EstActif',
      'dateCreation': 'DateCreation'
    };

    const backendField = fieldMapping[field] || field;
    if (this.sortField !== backendField) return 'bi bi-arrow-down-up';
    return this.sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
  }

  // ==================== PAGINATION ====================

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  onPageSizeChange(event: any): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value);
    this.currentPage = 1;
    this.loadClients();
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

  viewClient(id: number): void {
    this.router.navigate(['/clients', id]);
  }

  editClient(id: number): void {
    this.router.navigate(['/clients', id, 'edit']);
  }

  deleteClient(id: number): void {
    const confirmMessage = 'Êtes-vous sûr de vouloir supprimer ce client ?\n\n' +
      '⚠️ Cette action changera le statut du client à "Inactif".\n' +
      'Les clients inactifs ne seront plus visibles dans les listes principales.';
    
    if (confirm(confirmMessage)) {
      this.clientService.deleteClient(id).subscribe({
        next: (response: ClientApiResponse<any>) => {
          if (response.success) {
            this.loadClients();
            alert('✅ Client désactivé avec succès!\nLe client a été marqué comme inactif.');
          } else {
            alert(`❌ Échec de la désactivation:\n${response.message || 'Erreur inconnue du serveur'}`);
          }
        },
        error: (error: any) => {
          console.error('Error deleting client:', error);
          
          let errorMessage = 'Erreur lors de la désactivation du client';
          if (error.status === 401) {
            errorMessage = 'Non autorisé - Votre session a expiré. Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            errorMessage = 'Accès refusé - Seuls les administrateurs peuvent supprimer des clients.';
          } else if (error.status === 404) {
            errorMessage = 'Client non trouvé ou déjà supprimé.';
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

  createClient(): void {
    this.router.navigate(['/clients/new']);
  }

  // ==================== BULK ACTIONS ====================

  toggleClientSelection(clientId: number): void {
    const index = this.selectedClients.indexOf(clientId);
    if (index > -1) {
      this.selectedClients.splice(index, 1);
    } else {
      this.selectedClients.push(clientId);
    }
  }

  selectAllClients(): void {
    if (this.selectedClients.length === this.filteredClients.length) {
      this.selectedClients = [];
    } else {
      this.selectedClients = this.filteredClients.map(p => p.id);
    }
  }

  isClientSelected(clientId: number): boolean {
    return this.selectedClients.includes(clientId);
  }

  // ==================== UTILITY METHODS ====================

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return this.authService.hasRole(permission.split(',')[0]) || permission.split(',').some(role => this.authService.hasRole(role));
  }

  getStatusBadgeClass(estActif: boolean): string {
    return estActif ? 'badge bg-success' : 'badge bg-danger';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(value);
  }

  trackByClientId(index: number, client: ClientResponse): number {
    return client.id;
  }
}