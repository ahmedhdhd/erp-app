import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService } from '../../../services/sales.service';
import { InvoiceService } from '../../../services/invoice.service';
import { QuoteResponse, SalesApiResponse, CompanySettingsResponse } from '../../../models/sales.models';

@Component({
  selector: 'app-quote-detail',
  templateUrl: './quote-detail.component.html',
  styleUrls: ['./quote-detail.component.css']
})
export class QuoteDetailComponent implements OnInit {
  quote: QuoteResponse | null = null;
  companySettings: CompanySettingsResponse | null = null;
  loading = false;
  error: string | null = null;
  quoteId: number | null = null;

  constructor(
    private salesService: SalesService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.quoteId = +params['id'];
        this.loadQuote(this.quoteId);
        this.loadCompanySettings();
      }
    });
  }

  loadQuote(id: number): void {
    this.loading = true;
    this.error = null;

    this.salesService.getQuote(id).subscribe({
      next: (response: SalesApiResponse<QuoteResponse>) => {
        if (response.success && response.data) {
          this.quote = response.data;
        } else {
          this.error = response.message || 'Failed to load quote';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'An error occurred while loading the quote';
        this.loading = false;
        console.error('Error loading quote:', err);
      }
    });
  }

  loadCompanySettings(): void {
    this.salesService.getCompanySettings().subscribe({
      next: (response: SalesApiResponse<CompanySettingsResponse>) => {
        if (response.success && response.data) {
          this.companySettings = response.data;
        }
      },
      error: (err: any) => {
        console.error('Error loading company settings:', err);
      }
    });
  }

  editQuote(): void {
    if (this.quoteId) {
      this.router.navigate(['/sales/quotes/edit', this.quoteId]);
    }
  }

  goToList(): void {
    this.router.navigate(['/sales/quotes']);
  }

  printQuote(): void {
    if (!this.quote) {
      alert('Quote data not loaded');
      return;
    }

    try {
      this.invoiceService.generateQuoteInvoice(this.quote, this.companySettings);
    } catch (error) {
      console.error('Error generating quote invoice:', error);
      alert('Error generating quote invoice. Please check the console for details.');
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Brouillon': return 'bg-secondary';
      case 'Envoyé': return 'bg-primary';
      case 'Accepté': return 'bg-success';
      case 'Rejeté': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(amount);
  }
}