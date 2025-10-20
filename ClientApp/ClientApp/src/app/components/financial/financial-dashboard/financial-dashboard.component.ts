import { Component, OnInit } from '@angular/core';
import { FinancialService } from '../../../services/financial.service';
import { TrialBalance, ProfitLoss, BalanceSheet } from '../../../models/financial.models';

@Component({
  selector: 'app-financial-dashboard',
  templateUrl: './financial-dashboard.component.html',
  styleUrls: ['./financial-dashboard.component.css']
})
export class FinancialDashboardComponent implements OnInit {
  trialBalance: TrialBalance[] = [];
  profitLoss: ProfitLoss[] = [];
  balanceSheet: BalanceSheet[] = [];

  constructor(private financialService: FinancialService) {}

  ngOnInit(): void {
    this.financialService.getTrialBalance().subscribe(d => this.trialBalance = d);
    this.financialService.getProfitLoss().subscribe(d => this.profitLoss = d);
    this.financialService.getBalanceSheet().subscribe(d => this.balanceSheet = d);
  }
}


