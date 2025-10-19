import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinancialService } from '../../../../services/financial.service';
import { Partner, PartnerType, FinancialSearchDTO } from '../../../../models/financial.models';

@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.css']
})
export class PartnerListComponent implements OnInit {
  partners: Partner[] = [];
  filteredPartners: Partner[] = [];
  selectedPartners: number[] = [];
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

  // Partner types for filter
  partnerTypes = [
    { value: PartnerType.Client, label: 'Client' },
    { value: PartnerType.Supplier, label: 'Fournisseur' },
    { value: PartnerType.Both, label: 'Les deux' }
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
    this.loadPartners();
  }

  loadPartners(): void {
    this.loading = true;
    this.errorMessage = null;

    const searchDTO: FinancialSearchDTO = {
      searchTerm: this.searchForm.get('searchTerm')?.value || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.searchForm.get('sortBy')?.value,
      sortDescending: this.searchForm.get('sortDirection')?.value === 'desc',
      partnerType: this.searchForm.get('type')?.value || undefined
    };

    this.financialService.getPartners(searchDTO).subscribe({
      next: (data: Partner[]) => {
        this.partners = data;
        this.filteredPartners = [...data];
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading partners:', error);
        this.errorMessage = 'Erreur lors du chargement des partenaires';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPartners();
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
    this.loadPartners();
  }

  applyFilters(): void {
    this.onSearch();
  }

  createPartner(): void {
    this.router.navigate(['/financial/partners/new']);
  }

  viewPartner(id: number): void {
    this.router.navigate(['/financial/partners', id]);
  }

  editPartner(id: number): void {
    this.router.navigate(['/financial/partners', id, 'edit']);
  }

  deletePartner(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      // TODO: Implement delete functionality in the service
      console.log('Delete partner', id);
    }
  }

  selectAllPartners(): void {
    if (this.selectedPartners.length === this.filteredPartners.length) {
      this.selectedPartners = [];
    } else {
      this.selectedPartners = this.filteredPartners.map(partner => partner.id);
    }
  }

  togglePartnerSelection(id: number): void {
    const index = this.selectedPartners.indexOf(id);
    if (index > -1) {
      this.selectedPartners.splice(index, 1);
    } else {
      this.selectedPartners.push(id);
    }
  }

  isPartnerSelected(id: number): boolean {
    return this.selectedPartners.includes(id);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPartners();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1;
    this.loadPartners();
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

  getPartnerTypeDisplay(type: number): string {
    const partnerTypeMap: { [key: number]: string } = {
      1: 'Client',
      2: 'Fournisseur',
      3: 'Les deux'
    };
    return partnerTypeMap[type] || 'Inconnu';
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
    
    this.loadPartners();
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