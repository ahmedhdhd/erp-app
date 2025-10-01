import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService } from '../../../services/sales.service';
import { InvoiceService } from '../../../services/invoice.service';
import { SalesOrderResponse, SalesApiResponse, CompanySettingsResponse } from '../../../models/sales.models';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: SalesOrderResponse | null = null;
  companySettings: CompanySettingsResponse | null = null;
  loading = false;
  error: string | null = null;
  orderId: number | null = null;
  companySettingsLoaded = false;

  constructor(
    private salesService: SalesService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.orderId = +params['id'];
        this.loadOrder(this.orderId);
        this.loadCompanySettings();
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

  loadCompanySettings(): void {
    this.salesService.getCompanySettings().subscribe({
      next: (response: SalesApiResponse<CompanySettingsResponse>) => {
        console.log('Company settings response:', response); // Debug log
        if (response.success && response.data) {
          this.companySettings = response.data;
          console.log('Company settings loaded:', this.companySettings); // Debug log
        } else {
          console.log('Company settings response not successful or no data'); // Debug log
        }
        this.companySettingsLoaded = true;
      },
      error: (err: any) => {
        console.error('Error loading company settings:', err);
        this.companySettingsLoaded = true;
      }
    });
  }

  refreshCompanySettings(): void {
    console.log('Refreshing company settings...'); // Debug log
    this.companySettingsLoaded = false;
    this.loadCompanySettings();
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
    if (!this.order) {
      alert('Order data not loaded');
      return;
    }

    // If company settings haven't loaded yet, load them first
    if (!this.companySettingsLoaded) {
      console.log('Company settings not loaded yet, loading now...'); // Debug log
      this.loadCompanySettingsForPrint();
      return;
    }

    console.log('Generating invoice with company settings:', this.companySettings); // Debug log
    try {
      this.invoiceService.generateSalesOrderInvoice(this.order, this.companySettings);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please check the console for details.');
    }
  }

  loadCompanySettingsForPrint(): void {
    this.salesService.getCompanySettings().subscribe({
      next: (response: SalesApiResponse<CompanySettingsResponse>) => {
        if (response.success && response.data) {
          this.companySettings = response.data;
          console.log('Company settings loaded for print:', this.companySettings); // Debug log
        }
        this.companySettingsLoaded = true;
        // Now generate the invoice
        if (this.order) {
          this.invoiceService.generateSalesOrderInvoice(this.order, this.companySettings);
        }
      },
      error: (err: any) => {
        console.error('Error loading company settings for print:', err);
        this.companySettingsLoaded = true;
        // Even if company settings failed to load, generate invoice with null settings
        if (this.order) {
          this.invoiceService.generateSalesOrderInvoice(this.order, this.companySettings);
        }
      }
    });
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