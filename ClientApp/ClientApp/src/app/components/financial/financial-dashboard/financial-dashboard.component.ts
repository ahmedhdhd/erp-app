import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinancialService } from '../../../services/financial.service';
import { FinancialDashboardDTO, AccountBalanceDTO, RecentTransactionDTO } from '../../../models/financial.models';

@Component({
  selector: 'app-financial-dashboard',
  templateUrl: './financial-dashboard.component.html',
  styleUrls: ['./financial-dashboard.component.css']
})
export class FinancialDashboardComponent implements OnInit {
  dashboard: FinancialDashboardDTO | null = null;
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private financialService: FinancialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = null;

    this.financialService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.errorMessage = 'Erreur lors du chargement du tableau de bord financier';
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return this.financialService.formatCurrency(amount);
  }

  formatDate(date: Date | string): string {
    return this.financialService.formatDate(date);
  }

  navigateToAccounts(): void {
    this.router.navigate(['/financial/accounts']);
  }

  navigateToJournals(): void {
    this.router.navigate(['/financial/journals']);
  }

  navigateToPartners(): void {
    this.router.navigate(['/financial/partners']);
  }

  navigateToInvoices(): void {
    this.router.navigate(['/financial/invoices']);
  }

  navigateToPayments(): void {
    this.router.navigate(['/financial/payments']);
  }

  getAccountTypeDisplay(type: number): string {
    return this.financialService.getAccountTypeDisplay(type);
  }

  getAccountTypeIcon(type: number): string {
    const icons = {
      1: 'fas fa-building',      // Asset
      2: 'fas fa-credit-card',   // Liability
      3: 'fas fa-chart-line',    // Equity
      4: 'fas fa-arrow-up',      // Revenue
      5: 'fas fa-arrow-down',    // Expense
      6: 'fas fa-percentage',    // VAT
      7: 'fas fa-university',     // Bank
      8: 'fas fa-money-bill',    // Cash
      9: 'fas fa-users',         // Receivable
      10: 'fas fa-truck'         // Payable
    };
    return icons[type as keyof typeof icons] || 'fas fa-circle';
  }

  getAccountTypeColor(type: number): string {
    const colors = {
      1: 'text-primary',      // Asset
      2: 'text-warning',       // Liability
      3: 'text-success',        // Equity
      4: 'text-info',          // Revenue
      5: 'text-danger',        // Expense
      6: 'text-secondary',      // VAT
      7: 'text-primary',        // Bank
      8: 'text-success',        // Cash
      9: 'text-info',          // Receivable
      10: 'text-warning'       // Payable
    };
    return colors[type as keyof typeof colors] || 'text-secondary';
  }

  getTransactionIcon(type: string): string {
    const icons = {
      'Invoice': 'fas fa-file-invoice',
      'Payment': 'fas fa-credit-card',
      'Journal': 'fas fa-book',
      'Account': 'fas fa-chart-bar'
    };
    return icons[type as keyof typeof icons] || 'fas fa-circle';
  }

  getTransactionColor(type: string): string {
    const colors = {
      'Invoice': 'text-primary',
      'Payment': 'text-success',
      'Journal': 'text-info',
      'Account': 'text-warning'
    };
    return colors[type as keyof typeof colors] || 'text-secondary';
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }
}

