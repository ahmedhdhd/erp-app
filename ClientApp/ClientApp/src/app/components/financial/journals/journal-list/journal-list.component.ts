import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinancialService } from '../../../../services/financial.service';
import { Journal, JournalType, FinancialSearchDTO } from '../../../../models/financial.models';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrls: ['./journal-list.component.css']
})
export class JournalListComponent implements OnInit {
  journals: Journal[] = [];
  filteredJournals: Journal[] = [];
  selectedJournals: number[] = [];
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

  // Journal types for filter
  journalTypes = [
    { value: JournalType.Sales, label: 'Vente' },
    { value: JournalType.Purchase, label: 'Achat' },
    { value: JournalType.Bank, label: 'Banque' },
    { value: JournalType.Cash, label: 'Caisse' },
    { value: JournalType.Miscellaneous, label: 'Divers' }
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
    this.loadJournals();
  }

  loadJournals(): void {
    this.loading = true;
    this.errorMessage = null;

    const searchDTO: FinancialSearchDTO = {
      searchTerm: this.searchForm.get('searchTerm')?.value || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.searchForm.get('sortBy')?.value,
      sortDescending: this.searchForm.get('sortDirection')?.value === 'desc',
      journalType: this.searchForm.get('type')?.value || undefined
    };

    this.financialService.getJournals(searchDTO).subscribe({
      next: (data: Journal[]) => {
        this.journals = data;
        this.filteredJournals = [...data];
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading journals:', error);
        this.errorMessage = 'Erreur lors du chargement des journaux';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadJournals();
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
    this.loadJournals();
  }

  applyFilters(): void {
    this.onSearch();
  }

  createJournal(): void {
    this.router.navigate(['/financial/journals/new']);
  }

  viewJournal(id: number): void {
    this.router.navigate(['/financial/journals', id]);
  }

  editJournal(id: number): void {
    this.router.navigate(['/financial/journals', id, 'edit']);
  }

  deleteJournal(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce journal ?')) {
      // TODO: Implement delete functionality in the service
      console.log('Delete journal', id);
    }
  }

  selectAllJournals(): void {
    if (this.selectedJournals.length === this.filteredJournals.length) {
      this.selectedJournals = [];
    } else {
      this.selectedJournals = this.filteredJournals.map(journal => journal.id);
    }
  }

  toggleJournalSelection(id: number): void {
    const index = this.selectedJournals.indexOf(id);
    if (index > -1) {
      this.selectedJournals.splice(index, 1);
    } else {
      this.selectedJournals.push(id);
    }
  }

  isJournalSelected(id: number): boolean {
    return this.selectedJournals.includes(id);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadJournals();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1;
    this.loadJournals();
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

  getJournalTypeDisplay(type: number): string {
    const journalTypeMap: { [key: number]: string } = {
      1: 'Vente',
      2: 'Achat',
      3: 'Banque',
      4: 'Caisse',
      5: 'Divers'
    };
    return journalTypeMap[type] || 'Inconnu';
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
    
    this.loadJournals();
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