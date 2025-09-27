import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { SupplierService } from '../../../services/supplier.service';
import { ProductService } from '../../../services/product.service';
import { PurchaseOrderResponse, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseApiResponse } from '../../../models/purchase.models';
import { SupplierResponse, SupplierListResponse, SupplierApiResponse } from '../../../models/supplier.models';
import { ProductResponse, ProductListResponse, ProductApiResponse } from '../../../models/product.models';

@Component({
  selector: 'app-purchase-order-form',
  templateUrl: './purchase-order-form.component.html',
  styleUrls: ['./purchase-order-form.component.css']
})
export class PurchaseOrderFormComponent implements OnInit {
  purchaseOrderForm: FormGroup;
  isEditMode = false;
  purchaseOrderId: number | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  suppliers: SupplierResponse[] = [];
  products: ProductResponse[] = [];
  
  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.purchaseOrderForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.purchaseOrderId = +params['id'];
        this.loadPurchaseOrder(this.purchaseOrderId);
      }
    });
  }

  createForm(): FormGroup {
    // Set default date to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.fb.group({
      fournisseurId: ['', Validators.required],
      demandeId: [null],
      dateLivraisonPrevue: [today.toISOString().substring(0, 10), Validators.required],
      lignes: this.fb.array([this.createLineFormGroup()])
    });
  }

  createLineFormGroup(): FormGroup {
    return this.fb.group({
      produitId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get lignes(): FormArray {
    return this.purchaseOrderForm.get('lignes') as FormArray;
  }

  addLine(): void {
    this.lignes.push(this.createLineFormGroup());
  }

  removeLine(index: number): void {
    if (this.lignes.length > 1) {
      this.lignes.removeAt(index);
    }
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers(1, 100).subscribe({
      next: (response: SupplierApiResponse<SupplierListResponse>) => {
        if (response.success && response.data) {
          this.suppliers = response.data.fournisseurs;
        }
      },
      error: (err: any) => {
        console.error('Error loading suppliers:', err);
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts(1, 100).subscribe({
      next: (response: ProductApiResponse<ProductListResponse>) => {
        if (response.success && response.data) {
          this.products = response.data.products;
        }
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
      }
    });
  }

  loadPurchaseOrder(id: number): void {
    this.loading = true;
    this.purchaseService.getPurchaseOrder(id).subscribe({
      next: (response: PurchaseApiResponse<PurchaseOrderResponse>) => {
        if (response.success && response.data) {
          const order = response.data;
          this.purchaseOrderForm.patchValue({
            fournisseurId: order.fournisseurId,
            demandeId: order.demandeId,
            dateLivraisonPrevue: new Date(order.dateLivraisonPrevue).toISOString().substring(0, 10)
          });

          // Clear existing lines
          while (this.lignes.length > 0) {
            this.lignes.removeAt(0);
          }

          // Add lines from the order
          order.lignes.forEach(line => {
            const lineGroup = this.createLineFormGroup();
            lineGroup.patchValue({
              produitId: line.produitId,
              quantite: line.quantite,
              prixUnitaire: line.prixUnitaire
            });
            this.lignes.push(lineGroup);
          });
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error loading purchase order';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.purchaseOrderForm.valid) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const formValue = this.purchaseOrderForm.value;
      const request: CreatePurchaseOrderRequest | UpdatePurchaseOrderRequest = {
        fournisseurId: formValue.fournisseurId,
        dateLivraisonPrevue: new Date(formValue.dateLivraisonPrevue),
        lignes: formValue.lignes.map((line: any) => ({
          produitId: line.produitId,
          quantite: line.quantite,
          prixUnitaire: line.prixUnitaire
        }))
      };

      // Only add demandeId if it's provided and not null
      if (formValue.demandeId !== null && formValue.demandeId !== undefined && formValue.demandeId !== '') {
        request.demandeId = formValue.demandeId;
      }

      if (this.isEditMode && this.purchaseOrderId) {
        this.purchaseService.updatePurchaseOrder(this.purchaseOrderId, request as UpdatePurchaseOrderRequest).subscribe({
          next: (response: PurchaseApiResponse<PurchaseOrderResponse>) => {
            this.loading = false;
            if (response.success) {
              this.successMessage = 'Purchase order updated successfully';
              setTimeout(() => {
                this.router.navigate(['/purchase-orders']);
              }, 2000);
            } else {
              this.error = response.message || 'Failed to update purchase order';
            }
          },
          error: (err: any) => {
            this.loading = false;
            this.error = 'Error updating purchase order';
            console.error(err);
          }
        });
      } else {
        this.purchaseService.createPurchaseOrder(request as CreatePurchaseOrderRequest).subscribe({
          next: (response: PurchaseApiResponse<PurchaseOrderResponse>) => {
            this.loading = false;
            if (response.success) {
              this.successMessage = 'Purchase order created successfully';
              setTimeout(() => {
                this.router.navigate(['/purchase-orders']);
              }, 2000);
            } else {
              this.error = response.message || 'Failed to create purchase order';
            }
          },
          error: (err: any) => {
            this.loading = false;
            this.error = 'Error creating purchase order';
            console.error(err);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.purchaseOrderForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/purchase-orders']);
  }
}