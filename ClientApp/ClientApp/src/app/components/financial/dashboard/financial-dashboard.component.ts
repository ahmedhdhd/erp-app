import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-financial-dashboard',
  templateUrl: './financial-dashboard.component.html'
})
export class FinancialDashboardComponent implements OnInit {
  totals = {
    supplierPaid: 0,
    supplierUnpaid: 0,
    clientReceived: 0,
    clientPending: 0
  };

  dateFrom?: string;
  dateTo?: string;

  constructor(private http: HttpClient, private config: ConfigService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    // Placeholder: would call backend aggregate endpoints when available
    // For now, compute from journal if needed
    const base = this.config.apiUrl;
    this.http.post<any>(`${base}/journal/search`, {
      page: 1,
      pageSize: 1000,
      sortBy: 'date',
      sortDirection: 'desc',
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    }).subscribe({
      next: (res) => {
        if (!res.success) return;
        const items = res.data.journaux || [];
        this.totals.supplierPaid = items.filter((x: any) => x.type === 'Fournisseur').reduce((s: number, x: any) => s + x.montant, 0);
        this.totals.clientReceived = items.filter((x: any) => x.type === 'Client').reduce((s: number, x: any) => s + x.montant, 0);
        // Unpaid/pending placeholders until invoice balance endpoints exist
        this.totals.supplierUnpaid = 0;
        this.totals.clientPending = 0;
      },
      error: (e) => console.error('Dashboard load error', e)
    });
  }

  print(): void {
    window.print();
  }
}


