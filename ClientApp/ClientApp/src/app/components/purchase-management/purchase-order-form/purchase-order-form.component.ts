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
  
  // Properties for searchable product dropdown
  showProductDropdownForIndex: number | null = null;
  filteredProducts: { [key: number]: ProductResponse[] } = {};
  
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
    const group = this.fb.group({
      produitId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaireHT: [0, [Validators.required, Validators.min(0)]],
      tauxTVA: [0, [Validators.required, Validators.min(0)]],
      prixUnitaireTTC: [0] // Remove disabled state
    });
    
    // Add value change listeners to calculate TTC price
    group.get('prixUnitaireHT')?.valueChanges.subscribe(value => {
      console.log('prixUnitaireHT changed:', value);
      this.calculateTTCPrice(group);
    });
    
    group.get('tauxTVA')?.valueChanges.subscribe(value => {
      console.log('tauxTVA changed:', value);
      this.calculateTTCPrice(group);
    });
    
    return group;
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
      // Clean up filtered products
      delete this.filteredProducts[index];
      // Adjust indices of remaining filtered products
      const newFilteredProducts: { [key: number]: ProductResponse[] } = {};
      Object.keys(this.filteredProducts).forEach(key => {
        const oldIndex = parseInt(key);
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        newFilteredProducts[newIndex] = this.filteredProducts[oldIndex];
      });
      this.filteredProducts = newFilteredProducts;
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
    this.productService.getProducts(1, 1000).subscribe({
      next: (response: ProductApiResponse<ProductListResponse>) => {
        if (response.success && response.data) {
          this.products = response.data.products;
          console.log('Loaded products:', this.products);
          // Log the first few products to see their structure
          if (this.products.length > 0) {
            console.log('First product sample:', this.products[0]);
          }
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
              prixUnitaireHT: line.prixUnitaire,
              tauxTVA: 20, // Default VAT rate
              prixUnitaireTTC: line.prixUnitaire * 1.2
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

  // Product search methods
  getProductDisplayName(productId: number | null): string {
    if (!productId) return '';
    const product = this.products.find(p => p.id === productId);
    return product ? `${product.reference} - ${product.designation}` : '';
  }

  onProductSearch(event: any, index: number): void {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm.length > 0) {
      this.filteredProducts[index] = this.products.filter(product => 
        product.reference.toLowerCase().includes(searchTerm) || 
        product.designation.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredProducts[index] = [];
    }
    this.showProductDropdownForIndex = index;
  }

  showProductDropdown(index: number): void {
    this.showProductDropdownForIndex = index;
    // Show all products if input is empty
    if (!this.filteredProducts[index] || this.filteredProducts[index].length === 0) {
      this.filteredProducts[index] = this.products;
    }
  }

  hideProductDropdown(index: number, event: any): void {
    // Delay hiding to allow click events to register
    setTimeout(() => {
      this.showProductDropdownForIndex = null;
    }, 200);
  }

  getLineTotalTTC(line: any): number {
    const quantity = line.get('quantite')?.value || 0;
    const prixTTC = line.get('prixUnitaireTTC')?.value || 0;
    return quantity * prixTTC;
  }

selectProduct(index: number, product: ProductResponse): void {
  console.log('Selecting product:', product);
  const lineGroup = this.lignes.at(index) as FormGroup;
  
  if (lineGroup) {
    // Set all the product-related values
    lineGroup.patchValue({
      produitId: product.id,
      prixUnitaireHT: product.prixAchatHT || 0,
      tauxTVA: product.tauxTVA || 0
    });
    
    // Calculate TTC price after setting the values
    setTimeout(() => {
      this.calculateTTCPrice(lineGroup);
      console.log('Line group after selection:', lineGroup.value);
    }, 0);
  }
  
  // Hide the dropdown
  this.showProductDropdownForIndex = null;
  
  // Clear the filtered products for this index
  if (this.filteredProducts[index]) {
    delete this.filteredProducts[index];
  }
}

// Improved calculateTTCPrice method
calculateTTCPrice(lineGroup: FormGroup): void {
  const prixHT = parseFloat(lineGroup.get('prixUnitaireHT')?.value) || 0;
  const tauxTVA = parseFloat(lineGroup.get('tauxTVA')?.value) || 0;
  const prixTTC = prixHT * (1 + tauxTVA / 100);
  
  console.log('Calculating TTC:', { prixHT, tauxTVA, prixTTC });
  
  // Round to 3 decimal places to avoid floating point precision issues
  const roundedPrixTTC = Math.round(prixTTC * 1000) / 1000;
  
  lineGroup.get('prixUnitaireTTC')?.setValue(roundedPrixTTC, { emitEvent: false });
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
          prixUnitaire: line.prixUnitaireHT // Use HT price as the main price
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
    }
  }

  onCancel(): void {
    this.router.navigate(['/purchase-orders']);
  }
}