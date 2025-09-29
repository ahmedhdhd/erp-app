import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService } from '../../../services/sales.service';
import { SalesOrderResponse, SalesApiResponse } from '../../../models/sales.models';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: SalesOrderResponse | null = null;
  loading = false;
  error: string | null = null;
  orderId: number | null = null;

  constructor(
    private salesService: SalesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.orderId = +params['id'];
        this.loadOrder(this.orderId);
      }
    });
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.error = null;

    this.salesService.getSalesOrder(id).subscribe({
      next: (response: SalesApiResponse<SalesOrderResponse>) => {
        if (response.success && response.data) {
          this.order = response.data;
        } else {
          this.error = response.message || 'Failed to load order';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'An error occurred while loading the order';
        this.loading = false;
        console.error('Error loading order:', err);
      }
    });
  }

  editOrder(): void {
    if (this.orderId) {
      this.router.navigate(['/sales/orders/edit', this.orderId]);
    }
  }

  goToList(): void {
    this.router.navigate(['/sales/orders']);
  }

  printOrder(): void {
    if (this.orderId) {
      // Open a new tab with a simple invoice page
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Order #${this.orderId}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .order-info { margin-bottom: 20px; }
                .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Order #${this.orderId}</h1>
                <p>Thank you for your business!</p>
              </div>
              <div class="order-info">
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Order ID:</strong> #${this.orderId}</p>
              </div>
              <table class="items">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sample Product</td>
                    <td>1</td>
                    <td>$100.00</td>
                    <td>$100.00</td>
                  </tr>
                  <tr>
                    <td>Sample Service</td>
                    <td>2</td>
                    <td>$75.00</td>
                    <td>$150.00</td>
                  </tr>
                </tbody>
              </table>
              <div class="total">
                <p><strong>Subtotal:</strong> $250.00</p>
                <p><strong>Tax (20%):</strong> $50.00</p>
                <p><strong>Total:</strong> $300.00</p>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert('Please allow popups for this website to print the order.');
      }
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Brouillon': return 'bg-secondary';
      case 'Confirmé': return 'bg-primary';
      case 'Expédié': return 'bg-info';
      case 'Livré': return 'bg-success';
      case 'Annulé': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(amount);
  }
}