import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../../../services/purchase.service';
import { PurchaseApiResponse, PurchaseOrderListResponse } from '../../../models/purchase.models';

@Component({
  selector: 'app-test-api',
  template: `
    <div class="container mt-4">
      <h2>API Test Component</h2>
      <button class="btn btn-primary mb-3" (click)="testApi()">Test API</button>
      
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      <div *ngIf="data" class="alert alert-info">
        <pre>{{ data | json }}</pre>
      </div>
    </div>
  `
})
export class TestApiComponent implements OnInit {
  loading = false;
  error: string | null = null;
  data: any = null;

  constructor(private purchaseService: PurchaseService) {}

  ngOnInit(): void {}

  testApi(): void {
    this.loading = true;
    this.error = null;
    this.data = null;

    this.purchaseService.getAllPurchaseOrders(1, 10).subscribe({
      next: (response: PurchaseApiResponse<PurchaseOrderListResponse>) => {
        this.loading = false;
        this.data = response;
        console.log('API Test Response:', response);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error: ' + JSON.stringify(err);
        console.error('API Test Error:', err);
      }
    });
  }
}