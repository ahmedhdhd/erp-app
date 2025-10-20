import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinancialService } from '../../../services/financial.service';
import { Account } from '../../../models/financial.models';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  filter: string = '';

  constructor(
    private financialService: FinancialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.financialService.getAccounts().subscribe(d => this.accounts = d);
  }

  onCreateNew(): void {
    this.router.navigate(['/financial/accounts/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/financial/accounts/edit', id]);
  }
}


