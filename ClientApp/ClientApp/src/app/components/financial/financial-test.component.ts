import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-financial-test',
  templateUrl: './financial-test.component.html',
  styleUrls: ['./financial-test.component.css']
})
export class FinancialTestComponent implements OnInit {
  testResult: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.testFinancialModule();
  }

  testFinancialModule(): void {
    this.loading = true;
    this.http.get<any>('api/financialtest/test').subscribe({
      next: (response) => {
        this.testResult = response;
        this.loading = false;
      },
      error: (error) => {
        this.testResult = `Error: ${error.message}`;
        this.loading = false;
      }
    });
  }
}