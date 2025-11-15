import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-accounting-list',
  templateUrl: './accounting-list.component.html'
})
export class AccountingListComponent implements OnInit {
  items: any[] = [];
  page = 1;
  pageSize = 20;
  dateFrom?: string;
  dateTo?: string;
  account?: string;

  constructor(private http: HttpClient, private config: ConfigService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    const params: any = {
      page: this.page,
      pageSize: this.pageSize,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      account: this.account
    };
    this.http.get<any>(`${this.config.apiUrl}/accounting`, { params }).subscribe({
      next: (res) => {
        if (res.success) this.items = res.data?.items || [];
      },
      error: (e) => console.error('Accounting list error', e)
    });
  }
}


