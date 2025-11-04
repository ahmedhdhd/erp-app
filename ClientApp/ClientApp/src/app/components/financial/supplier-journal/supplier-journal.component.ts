import { Component, OnInit } from '@angular/core';
import { FinancialService } from '../../../services/financial.service';
import { SupplierService } from '../../../services/supplier.service';

@Component({
  selector: 'app-supplier-journal',
  templateUrl: './supplier-journal.component.html',
  styleUrls: ['./supplier-journal.component.css']
})
export class SupplierJournalComponent implements OnInit {
  suppliers: any[] = [];
  selectedSupplierId: string = '';
  startDate: string = '';
  endDate: string = '';
  journalEntries: any[] = [];
  summaryData: any = {
    ancienSolde: 0,
    totalDebit: 0,
    totalCredit: 0,
    soldeActuel: 0
  };
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalEntries: number = 0;
  selectedEntry: any = null;

  constructor(
    private financialService: FinancialService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadJournalEntries();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.suppliers = response.data.fournisseurs || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading suppliers', error);
      }
    });
  }

  loadJournalEntries(): void {
    const supplierId = this.selectedSupplierId ? parseInt(this.selectedSupplierId, 10) : undefined;
    
    this.financialService.getSupplierJournal(
      supplierId || 0,
      this.startDate,
      this.endDate,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.journalEntries = response.data.journaux || [];
          this.totalEntries = response.data.totalCount || 0;
          this.totalPages = response.data.totalPages || 0;
          
          // Calculate summary data
          this.calculateSummary();
        }
      },
      error: (error: any) => {
        console.error('Error loading journal entries', error);
      }
    });
  }

  calculateSummary(): void {
    // Reset summary data
    this.summaryData = {
      ancienSolde: 0,
      totalDebit: 0,
      totalCredit: 0,
      soldeActuel: 0
    };

    // Calculate totals
    this.journalEntries.forEach(entry => {
      if (entry.montant > 0) {
        this.summaryData.totalDebit += entry.montant;
      } else {
        this.summaryData.totalCredit += Math.abs(entry.montant);
      }
    });

    // Calculate current balance (simplified calculation)
    this.summaryData.soldeActuel = this.summaryData.totalCredit - this.summaryData.totalDebit;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadJournalEntries();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadJournalEntries();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  viewEntry(entry: any): void {
    this.selectedEntry = entry;
    // In a real implementation, you would open a modal here
    console.log('View entry:', entry);
  }

  deleteEntry(entry: any): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      // In a real implementation, you would call the API to delete the entry
      console.log('Delete entry:', entry);
    }
  }

  exportToExcel(): void {
    // In a real implementation, you would export to Excel
    alert('Export to Excel functionality would be implemented here');
  }

  exportToPdf(): void {
    // In a real implementation, you would export to PDF
    alert('Export to PDF functionality would be implemented here');
  }
}