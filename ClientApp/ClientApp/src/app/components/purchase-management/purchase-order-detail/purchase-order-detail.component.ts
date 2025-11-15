import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { PurchaseOrderResponse, PurchaseApiResponse } from '../../../models/purchase.models';
import { InvoiceService } from '../../../services/invoice.service';
import { SalesOrderResponse } from '../../../models/sales.models';

@Component({
  selector: 'app-purchase-order-detail',
  templateUrl: './purchase-order-detail.component.html',
  styleUrls: ['./purchase-order-detail.component.css']
})
export class PurchaseOrderDetailComponent implements OnInit {
  purchaseOrder: PurchaseOrderResponse | null = null;
  loading = false;
  error: string | null = null;
  purchaseOrderId: number | null = null;

  constructor(
    private purchaseService: PurchaseService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        const id = +params['id'];
        // Validate that id is a valid number
        if (!isNaN(id) && id > 0) {
          this.purchaseOrderId = id;
          this.loadPurchaseOrder(this.purchaseOrderId);
        } else {
          this.error = 'Invalid purchase order ID';
          this.loading = false;
          console.error('Invalid purchase order ID:', params['id']);
        }
      }
    });
  }

  loadPurchaseOrder(id: number): void {
    // Validate the ID before making the API call
    if (isNaN(id) || id <= 0) {
      this.error = 'Invalid purchase order ID';
      this.loading = false;
      console.error('Attempted to load purchase order with invalid ID:', id);
      return;
    }
    
    this.loading = true;
    this.error = null;

    this.purchaseService.getPurchaseOrder(id).subscribe({
      next: (response: PurchaseApiResponse<PurchaseOrderResponse>) => {
        if (response.success && response.data) {
          this.purchaseOrder = response.data;
        } else {
          this.error = response.message || 'Failed to load purchase order';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'An error occurred while loading the purchase order';
        this.loading = false;
        console.error(err);
      }
    });
  }

  editPurchaseOrder(): void {
    if (this.purchaseOrderId && !isNaN(this.purchaseOrderId) && this.purchaseOrderId > 0) {
      this.router.navigate(['/purchase-orders', this.purchaseOrderId, 'edit']);
    } else {
      console.error('Cannot edit purchase order: Invalid ID', this.purchaseOrderId);
      this.error = 'Cannot edit purchase order: Invalid ID';
    }
  }

  deletePurchaseOrder(): void {
    if (this.purchaseOrderId && !isNaN(this.purchaseOrderId) && this.purchaseOrderId > 0 && confirm('Are you sure you want to delete this purchase order?')) {
      this.purchaseService.deletePurchaseOrder(this.purchaseOrderId).subscribe({
        next: (response: PurchaseApiResponse<void>) => {
          if (response.success) {
            this.router.navigate(['/purchase-orders']);
          } else {
            this.error = response.message || 'Failed to delete purchase order';
          }
        },
        error: (err: any) => {
          this.error = 'An error occurred while deleting the purchase order';
          console.error(err);
        }
      });
    } else if (this.purchaseOrderId && (isNaN(this.purchaseOrderId) || this.purchaseOrderId <= 0)) {
      this.error = 'Cannot delete purchase order: Invalid ID';
      console.error('Cannot delete purchase order: Invalid ID', this.purchaseOrderId);
    }
  }

  submitPurchaseOrder(): void {
    if (this.purchaseOrderId && confirm('Are you sure you want to submit this purchase order? This will reserve the quantities of all products included in this order by decreasing current stock.')) {
      this.purchaseService.submitPurchaseOrder({ commandeId: this.purchaseOrderId }).subscribe({
        next: (response: PurchaseApiResponse<PurchaseOrderResponse>) => {
          if (response.success && response.data) {
            this.purchaseOrder = response.data;
            // Show success message
            alert('Purchase order submitted successfully. Product quantities have been reserved (stock decreased).');
          } else {
            this.error = response.message || 'Failed to submit purchase order';
          }
        },
        error: (err: any) => {
          this.error = 'An error occurred while submitting the purchase order';
          console.error(err);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'brouillon':
        return 'badge bg-secondary';
      case 'envoyée':
        return 'badge bg-primary';
      case 'partielle':
        return 'badge bg-warning';
      case 'livrée':
        return 'badge bg-success';
      case 'annulée':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  goToList(): void {
    this.router.navigate(['/purchase-orders']);
  }

  canReceiveGoods(): boolean {
    if (!this.purchaseOrder) return false;
    const status = this.purchaseOrder.statut?.toLowerCase();
    return status === 'envoyée' || status === 'partielle';
  }

  receiveGoods(): void {
    if (this.purchaseOrderId) {
      // Check if order can be received
      if (!this.canReceiveGoods()) {
        this.error = 'La commande doit être soumise avant de pouvoir recevoir des marchandises';
        return;
      }
      this.router.navigate(['/purchase-orders', this.purchaseOrderId, 'receive']);
    }
  }

  getProductName(line: any): string {
    if (line.ligneCommande && line.ligneCommande.produit) {
      return line.ligneCommande.produit.designation || 'N/A';
    }
    // Fallback to find product from purchase order lines
    if (this.purchaseOrder && line.ligneCommandeId) {
      const orderLine = this.purchaseOrder.lignes.find(l => l.id === line.ligneCommandeId);
      if (orderLine && orderLine.produit) {
        return orderLine.produit.designation || 'N/A';
      }
    }
    return 'N/A';
  }

  getProductReference(line: any): string {
    if (line.ligneCommande && line.ligneCommande.produit) {
      return line.ligneCommande.produit.reference || 'N/A';
    }
    // Fallback to find product from purchase order lines
    if (this.purchaseOrder && line.ligneCommandeId) {
      const orderLine = this.purchaseOrder.lignes.find(l => l.id === line.ligneCommandeId);
      if (orderLine && orderLine.produit) {
        return orderLine.produit.reference || 'N/A';
      }
    }
    return 'N/A';
  }
}