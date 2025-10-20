import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FinancialService } from '../../../services/financial.service';

interface JournalSearchRequest {
  type?: 'Client' | 'Fournisseur';
  ownerId?: number;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrls: []
})
export class JournalListComponent implements OnInit {
  items: any[] = [];
  total = 0;
  request: JournalSearchRequest = {
    page: 1,
    pageSize: 20,
    sortBy: 'date',
    sortDirection: 'desc'
  };
  ownerName?: string;
  paymentType?: string;

  constructor(private http: HttpClient, private financial: FinancialService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    const url = `${this.financial['baseUrl']}/journal/search`;
    const payload: any = { ...this.request };
    // Backend supports ownerId; mapping ownerName would require lookup; leaving note for enhancement.
    // Include future fields if backend extended
    payload.paymentType = this.paymentType;
    this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.items = res.data.journaux || [];
          this.total = res.data.totalCount || 0;
        }
      },
      error: (e) => console.error('Journal search error', e)
    });
  }
}


