import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinancialService } from '../../../../services/financial.service';
import { Payment, PaymentType, PaymentStatus, PaymentMethod, FinancialSearchDTO } from '../../../../models/financial.models';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  selectedPayments: number[] = [];
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

  // Payment types for filter
  paymentTypes = [
    { value: PaymentType.Incoming, label: 'Entrant' },
    { value: PaymentType.Outgoing, label: 'Sortant' }
  ];

  // Payment statuses for filter
  paymentStatuses = [
    { value: PaymentStatus.Draft, label: 'Brouillon' },
    { value: PaymentStatus.Validated, label: 'Validé' },
    { value: PaymentStatus.Posted, label: 'Comptabilisé' },
    { value: PaymentStatus.Cancelled, label: 'Annulé' }
  ];

  // Payment methods for filter
  paymentMethods = [
    { value: PaymentMethod.Cash, label: 'Espèces' },
    { value: PaymentMethod.BankTransfer, label: 'Virement' },
    { value: PaymentMethod.Check, label: 'Chèque' },
    { value: PaymentMethod.CreditCard, label: 'Carte de crédit' },
    { value: PaymentMethod.Other, label: 'Autre' }
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
      method: [''],
      sortBy: ['paymentDate'],
      sortDirection: ['desc']
    });
  }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.errorMessage = null;

    const searchDTO: FinancialSearchDTO = {
      searchTerm: this.searchForm.get('searchTerm')?.value || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.searchForm.get('sortBy')?.value,
      sortDescending: this.searchForm.get('sortDirection')?.value === 'desc',
      paymentType: this.searchForm.get('type')?.value || undefined,
      paymentStatus: this.searchForm.get('status')?.value || undefined
      // Note: paymentMethod is not supported in FinancialSearchDTO
    };

    this.financialService.getPayments(searchDTO).subscribe({
      next: (data: Payment[]) => {
        this.payments = data;
        this.filteredPayments = [...data];
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading payments:', error);
        this.errorMessage = 'Erreur lors du chargement des paiements';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPayments();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchForm.reset({
      searchTerm: '',
      type: '',
      status: '',
      method: '',
      sortBy: 'paymentDate',
      sortDirection: 'desc'
    });
    this.currentPage = 1;
    this.loadPayments();
  }

  applyFilters(): void {
    this.onSearch();
  }

  createPayment(): void {
    this.router.navigate(['/financial/payments/new']);
  }

  viewPayment(id: number): void {
    this.router.navigate(['/financial/payments', id]);
  }

  editPayment(id: number): void {
    this.router.navigate(['/financial/payments', id, 'edit']);
  }

  deletePayment(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      // TODO: Implement delete functionality in the service
      console.log('Delete payment', id);
    }
  }

  selectAllPayments(): void {
    if (this.selectedPayments.length === this.filteredPayments.length) {
      this.selectedPayments = [];
    } else {
      this.selectedPayments = this.filteredPayments.map(payment => payment.id);
    }
  }

  togglePaymentSelection(id: number): void {
    const index = this.selectedPayments.indexOf(id);
    if (index > -1) {
      this.selectedPayments.splice(index, 1);
    } else {
      this.selectedPayments.push(id);
    }
  }

  isPaymentSelected(id: number): boolean {
    return this.selectedPayments.includes(id);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPayments();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.currentPage = 1;
    this.loadPayments();
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

  getPaymentTypeDisplay(type: number): string {
    const paymentTypeMap: { [key: number]: string } = {
      1: 'Entrant',
      2: 'Sortant'
    };
    return paymentTypeMap[type] || 'Inconnu';
  }

  getPaymentStatusDisplay(status: number): string {
    const paymentStatusMap: { [key: number]: string } = {
      1: 'Brouillon',
      2: 'Validé',
      3: 'Comptabilisé',
      4: 'Annulé'
    };
    return paymentStatusMap[status] || 'Inconnu';
  }

  getPaymentMethodDisplay(method: number): string {
    const paymentMethodMap: { [key: number]: string } = {
      1: 'Espèces',
      2: 'Virement',
      3: 'Chèque',
      4: 'Carte de crédit',
      5: 'Autre'
    };
    return paymentMethodMap[method] || 'Inconnu';
  }

  getPaymentStatusBadgeClass(status: number): string {
    const statusClassMap: { [key: number]: string } = {
      1: 'badge bg-secondary',  // Draft
      2: 'badge bg-warning',    // Validated
      3: 'badge bg-info',       // Posted
      4: 'badge bg-danger'      // Cancelled
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
    
    this.loadPayments();
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