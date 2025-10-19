import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinancialService } from '../../../../services/financial.service';
import { Invoice, InvoiceType, InvoiceStatus, FinancialSearchDTO } from '../../../../models/financial.models';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  selectedInvoices: number[] = [];
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
  
  // Add today property for template access
  today = new Date();

  // Search form
  searchForm: FormGroup;

  // Invoice types for filter
  invoiceTypes = [
    { value: InvoiceType.Sales, label: 'Vente' },
    { value: InvoiceType.Purchase, label: 'Achat' },
    { value: InvoiceType.CreditNote, label: 'Avoir' },
    { value: InvoiceType.DebitNote, label: 'Note de débit' }
  ];

  // Invoice statuses for filter
  invoiceStatuses = [
    { value: InvoiceStatus.Draft, label: 'Brouillon' },
    { value: InvoiceStatus.Validated, label: 'Validé' },
    { value: InvoiceStatus.Posted, label: 'Comptabilisé' },
    { value: InvoiceStatus.Paid, label: 'Payé' },
    { value: InvoiceStatus.Partial, label: 'Partiellement payé' },
    { value: InvoiceStatus.Cancelled, label: 'Annulé' }
  ];

  constructor(
    private financialService: FinancialService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      type: [''],
      status: [''],
      sortBy: ['invoiceDate'],
      sortDirection: ['desc']
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.errorMessage = null;

    const searchDTO: FinancialSearchDTO = {
      searchTerm: this.searchForm.get('searchTerm')?.value || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.searchForm.get('sortBy')?.value,
      sortDescending: this.searchForm.get('sortDirection')?.value === 'desc',
      invoiceType: this.searchForm.get('type')?.value || undefined,
      invoiceStatus: this.searchForm.get('status')?.value || undefined
    };

    this.financialService.getInvoices(searchDTO).subscribe({
      next: (data: Invoice[]) => {
        this.invoices = data;
        this.filteredInvoices = [...data];
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading invoices:', error);
        this.errorMessage = 'Erreur lors du chargement des factures';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadInvoices();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchForm.reset({
      searchTerm: '',
      type: '',
      status: '',
      sortBy: 'invoiceDate',
      sortDirection: 'desc'
    });
    this.currentPage = 1;
    this.loadInvoices();
  }

  applyFilters(): void {
    this.onSearch();
  }

  createInvoice(): void {
    this.router.navigate(['/financial/invoices/new']);
  }

  viewInvoice(id: number): void {
    this.router.navigate(['/financial/invoices', id]);
  }

  editInvoice(id: number): void {
    this.router.navigate(['/financial/invoices', id, 'edit']);
  }

  deleteInvoice(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      // TODO: Implement delete functionality in the service
      console.log('Delete invoice', id);
    }
  }

  selectAllInvoices(): void {
    if (this.selectedInvoices.length === this.filteredInvoices.length) {
      this.selectedInvoices = [];
    } else {
      this.selectedInvoices = this.filteredInvoices.map(invoice => invoice.id);
    }
  }

  toggleInvoiceSelection(id: number): void {
    const index = this.selectedInvoices.indexOf(id);
    if (index > -1) {
      this.selectedInvoices.splice(index, 1);
    } else {
      this.selectedInvoices.push(id);
    }
  }

  isInvoiceSelected(id: number): boolean {
    return this.selectedInvoices.includes(id);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInvoices();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1;
    this.loadInvoices();
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

  getInvoiceTypeDisplay(type: number): string {
    const invoiceTypeMap: { [key: number]: string } = {
      1: 'Vente',
      2: 'Achat',
      3: 'Avoir',
      4: 'Note de débit'
    };
    return invoiceTypeMap[type] || 'Inconnu';
  }

  getInvoiceStatusDisplay(status: number): string {
    const invoiceStatusMap: { [key: number]: string } = {
      1: 'Brouillon',
      2: 'Validé',
      3: 'Comptabilisé',
      4: 'Payé',
      5: 'Partiel',
      6: 'Annulé'
    };
    return invoiceStatusMap[status] || 'Inconnu';
  }

  getInvoiceStatusBadgeClass(status: number): string {
    const statusClassMap: { [key: number]: string } = {
      1: 'badge bg-secondary',  // Draft
      2: 'badge bg-warning',    // Validated
      3: 'badge bg-info',       // Posted
      4: 'badge bg-success',    // Paid
      5: 'badge bg-primary',    // Partial
      6: 'badge bg-danger'      // Cancelled
    };
    return statusClassMap[status] || 'badge bg-secondary';
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
    
    this.loadInvoices();
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