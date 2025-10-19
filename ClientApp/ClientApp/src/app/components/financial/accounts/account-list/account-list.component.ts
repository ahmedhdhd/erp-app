import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinancialService } from '../../../../services/financial.service';
import { Account, AccountType, FinancialSearchDTO } from '../../../../models/financial.models';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  selectedAccounts: number[] = [];
  loading = false;
  errorMessage: string | null = null;
  showFilters = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Add Math property for template access
  Math = Math;

  // Search form
  searchForm: FormGroup;

  // Account types for filter
  accountTypes = [
    { value: AccountType.Asset, label: 'Actif' },
    { value: AccountType.Liability, label: 'Passif' },
    { value: AccountType.Equity, label: 'Capitaux propres' },
    { value: AccountType.Revenue, label: 'Produits' },
    { value: AccountType.Expense, label: 'Charges' },
    { value: AccountType.VAT, label: 'TVA' },
    { value: AccountType.Bank, label: 'Banque' },
    { value: AccountType.Cash, label: 'Caisse' },
    { value: AccountType.Receivable, label: 'Clients' },
    { value: AccountType.Payable, label: 'Fournisseurs' }
  ];

  constructor(
    private financialService: FinancialService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      type: [''],
      isActive: [''],
      sortBy: ['name'],
      sortDirection: ['asc']
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.errorMessage = null;

    const searchDTO: FinancialSearchDTO = {
      searchTerm: this.searchForm.get('searchTerm')?.value || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.searchForm.get('sortBy')?.value,
      sortDescending: this.searchForm.get('sortDirection')?.value === 'desc',
      accountType: this.searchForm.get('type')?.value || undefined
    };

    this.financialService.getAccounts(searchDTO).subscribe({
      next: (data: Account[]) => {
        this.accounts = data;
        this.filteredAccounts = [...data];
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading accounts:', error);
        this.errorMessage = 'Erreur lors du chargement des comptes';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAccounts();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchForm.reset({
      searchTerm: '',
      type: '',
      isActive: '',
      sortBy: 'name',
      sortDirection: 'asc'
    });
    this.currentPage = 1;
    this.loadAccounts();
  }

  applyFilters(): void {
    this.onSearch();
  }

  createAccount(): void {
    this.router.navigate(['/financial/accounts/new']);
  }

  viewAccount(id: number): void {
    this.router.navigate(['/financial/accounts', id]);
  }

  editAccount(id: number): void {
    this.router.navigate(['/financial/accounts', id, 'edit']);
  }

  deleteAccount(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      this.financialService.deleteAccount(id).subscribe({
        next: () => {
          this.loadAccounts();
        },
        error: (error: any) => {
          console.error('Error deleting account:', error);
          this.errorMessage = 'Erreur lors de la suppression du compte';
        }
      });
    }
  }

  selectAllAccounts(): void {
    if (this.selectedAccounts.length === this.filteredAccounts.length) {
      this.selectedAccounts = [];
    } else {
      this.selectedAccounts = this.filteredAccounts.map(account => account.id);
    }
  }

  toggleAccountSelection(id: number): void {
    const index = this.selectedAccounts.indexOf(id);
    if (index > -1) {
      this.selectedAccounts.splice(index, 1);
    } else {
      this.selectedAccounts.push(id);
    }
  }

  isAccountSelected(id: number): boolean {
    return this.selectedAccounts.includes(id);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAccounts();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1;
    this.loadAccounts();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatCurrency(amount: number): string {
    return this.financialService.formatCurrency(amount);
  }

  getAccountTypeDisplay(type: number): string {
    return this.financialService.getAccountTypeDisplay(type);
  }

  getStatusBadgeClass(isActive: boolean): string {
    return this.financialService.getStatusBadgeClass(isActive);
  }

  sort(column: string): void {
    const currentSortBy = this.searchForm.get('sortBy')?.value;
    const currentDirection = this.searchForm.get('sortDirection')?.value;
    
    let newDirection = 'asc';
    if (currentSortBy === column && currentDirection === 'asc') {
      newDirection = 'desc';
    }
    
    this.searchForm.patchValue({
      sortBy: column,
      sortDirection: newDirection
    });
    
    this.loadAccounts();
  }

  getSortIcon(column: string): string {
    const currentSortBy = this.searchForm.get('sortBy')?.value;
    const currentDirection = this.searchForm.get('sortDirection')?.value;
    
    if (currentSortBy !== column) {
      return 'fas fa-sort text-muted';
    }
    
    return currentDirection === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
  }
}
