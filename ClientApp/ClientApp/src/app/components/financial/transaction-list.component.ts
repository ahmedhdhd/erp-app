import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinancialService } from '../../services/financial.service';
import { Transaction } from '../../models/financial.models';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  loading: boolean = false;

  constructor(
    private financialService: FinancialService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.financialService.getAllTransactions(this.currentPage, this.pageSize).subscribe(response => {
      if (response.success) {
        this.transactions = response.data || [];
        this.totalCount = response.totalCount || 0;
        this.totalPages = response.totalPages || 0;
      }
      this.loading = false;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  onEdit(transaction: Transaction): void {
    this.router.navigate(['/financial/transactions/edit', transaction.id]);
  }

  onDelete(transaction: Transaction): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la transaction "${transaction.description}" ?`)) {
      this.financialService.deleteTransaction(transaction.id).subscribe(response => {
        if (response.success) {
          this.loadTransactions();
        } else {
          alert('Erreur lors de la suppression de la transaction');
        }
      });
    }
  }

  onView(transaction: Transaction): void {
    this.router.navigate(['/financial/transactions/view', transaction.id]);
  }

  onAddNew(): void {
    this.router.navigate(['/financial/transactions/new']);
  }
}