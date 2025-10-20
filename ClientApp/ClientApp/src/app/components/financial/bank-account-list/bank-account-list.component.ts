import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinancialService } from '../../../services/financial.service';
import { BankAccount } from '../../../models/financial.models';

@Component({
  selector: 'app-bank-account-list',
  templateUrl: './bank-account-list.component.html',
  styleUrls: ['./bank-account-list.component.css']
})
export class BankAccountListComponent implements OnInit {
  bankAccounts: BankAccount[] = [];

  constructor(
    private financialService: FinancialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBankAccounts();
  }

  loadBankAccounts(): void {
    this.financialService.getBankAccounts().subscribe(accounts => {
      this.bankAccounts = accounts;
    });
  }

  onCreateNew(): void {
    this.router.navigate(['/financial/bank-accounts/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/financial/bank-accounts/edit', id]);
  }

  onView(id: number): void {
    this.router.navigate(['/financial/bank-accounts', id]);
  }
}
