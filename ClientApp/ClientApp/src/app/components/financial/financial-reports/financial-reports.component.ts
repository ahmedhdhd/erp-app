import { Component, OnInit } from '@angular/core';
import { FinancialService } from '../../../services/financial.service';
import { TrialBalance, ProfitLoss, BalanceSheet } from '../../../models/financial.models';

@Component({
  selector: 'app-financial-reports',
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.css']
})
export class FinancialReportsComponent implements OnInit {
  trialBalance: TrialBalance[] = [];
  profitLoss: ProfitLoss[] = [];
  balanceSheet: BalanceSheet[] = [];
  
  // Date filters
  startDate: string = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  asOfDate: string = new Date().toISOString().split('T')[0];
  
  loading = false;
  activeTab = 'trial-balance';

  constructor(private financialService: FinancialService) {}

  ngOnInit(): void {
    this.loadTrialBalance();
  }

  loadTrialBalance(): void {
    this.loading = true;
    this.financialService.getTrialBalance(this.asOfDate).subscribe({
      next: (data) => {
        this.trialBalance = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trial balance:', error);
        this.loading = false;
      }
    });
  }

  loadProfitLoss(): void {
    this.loading = true;
    this.financialService.getProfitLoss(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.profitLoss = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profit & loss:', error);
        this.loading = false;
      }
    });
  }

  loadBalanceSheet(): void {
    this.loading = true;
    this.financialService.getBalanceSheet(this.asOfDate).subscribe({
      next: (data) => {
        this.balanceSheet = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading balance sheet:', error);
        this.loading = false;
      }
    });
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    switch (tab) {
      case 'trial-balance':
        this.loadTrialBalance();
        break;
      case 'profit-loss':
        this.loadProfitLoss();
        break;
      case 'balance-sheet':
        this.loadBalanceSheet();
        break;
    }
  }

  onDateChange(): void {
    switch (this.activeTab) {
      case 'trial-balance':
        this.loadTrialBalance();
        break;
      case 'profit-loss':
        this.loadProfitLoss();
        break;
      case 'balance-sheet':
        this.loadBalanceSheet();
        break;
    }
  }

  getTotalDebits(): number {
    return this.trialBalance.reduce((total, item) => total + item.debitBalance, 0);
  }

  getTotalCredits(): number {
    return this.trialBalance.reduce((total, item) => total + item.creditBalance, 0);
  }

  getTotalRevenue(): number {
    return this.profitLoss
      .filter(item => item.type === 'Revenue')
      .reduce((total, item) => total + item.amount, 0);
  }

  getTotalExpenses(): number {
    return this.profitLoss
      .filter(item => item.type === 'Expense')
      .reduce((total, item) => total + item.amount, 0);
  }

  getNetIncome(): number {
    return this.getTotalRevenue() - this.getTotalExpenses();
  }

  getTotalAssets(): number {
    return this.balanceSheet
      .filter(item => item.type === 'Asset')
      .reduce((total, item) => total + item.balance, 0);
  }

  getTotalLiabilities(): number {
    return this.balanceSheet
      .filter(item => item.type === 'Liability')
      .reduce((total, item) => total + item.balance, 0);
  }

  getTotalEquity(): number {
    return this.balanceSheet
      .filter(item => item.type === 'Equity')
      .reduce((total, item) => total + item.balance, 0);
  }
}
