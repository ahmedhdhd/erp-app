import { Component, OnInit } from '@angular/core';
import { FinancialService } from '../../services/financial.service';
import { Transaction, Budget, FinancialReport } from '../../models/financial.models';

@Component({
  selector: 'app-financial-dashboard',
  templateUrl: './financial-dashboard.component.html',
  styleUrls: ['./financial-dashboard.component.css']
})
export class FinancialDashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  budgets: Budget[] = [];
  reports: FinancialReport[] = [];
  totalIncome: number = 0;
  totalExpenses: number = 0;
  balance: number = 0;

  constructor(private financialService: FinancialService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load recent transactions
    this.financialService.getAllTransactions(1, 10).subscribe(response => {
      if (response.success) {
        this.transactions = response.data || [];
        this.calculateTotals();
      }
    });

    // Load budgets
    this.financialService.getAllBudgets().subscribe(response => {
      if (response.success) {
        this.budgets = response.data || [];
      }
    });

    // Load reports
    this.financialService.getAllReports().subscribe(response => {
      if (response.success) {
        this.reports = response.data || [];
      }
    });
  }

  calculateTotals(): void {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, transaction) => sum + transaction.montant, 0);

    this.totalExpenses = this.transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, transaction) => sum + transaction.montant, 0);

    this.balance = this.totalIncome - this.totalExpenses;
  }
}