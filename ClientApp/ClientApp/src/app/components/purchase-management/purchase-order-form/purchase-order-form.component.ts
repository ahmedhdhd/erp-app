import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { SupplierService } from '../../../services/supplier.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { PurchaseOrderResponse, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseApiResponse } from '../../../models/purchase.models';
import { FinancialService } from '../../../services/financial.service';
import { ReglementResponse, CreateReglementRequest, UpdateReglementRequest, FinancialApiResponse } from '../../../models/financial.models';
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
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private financialService: FinancialService
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
      
      // Refresh filtered products for remaining lines
      this.refreshFilteredProducts();
    } else {
      // If it's the last line, just reset it
      const lineGroup = this.createLineFormGroup();
      this.lignes.setControl(0, lineGroup);
      
      // Refresh filtered products
      this.refreshFilteredProducts();
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
            // Since the backend DTO has separate HT/TTC fields but frontend now has separate fields too,
            // we'll use the correct fields
            const prixHT = line.prixUnitaireHT;
            const tauxTVA = line.tauxTVA || line.produit?.tauxTVA || 20; // Default to 20% if not available
            const prixTTC = line.prixUnitaireTTC || prixHT * (1 + tauxTVA / 100);
            
            lineGroup.patchValue({
              produitId: line.produitId,
              quantite: line.quantite,
              prixUnitaireHT: prixHT,
              tauxTVA: tauxTVA,
              prixUnitaireTTC: prixTTC
            });
            
            // Trigger TTC calculation to ensure it's properly updated
            setTimeout(() => {
              this.calculateTTCPrice(lineGroup);
            }, 0);
            
            this.lignes.push(lineGroup);
          });

          // Load reglements for this purchase order
          this.loadReglements();
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

  // ========== Reglements UI ==========
  reglements: ReglementResponse[] = [];
  isAddingReglement = false;
  newReglement: any = { nature: 'Espece', numero: '', montant: 0, date: new Date().toISOString().substring(0,10), banque: '', dateEcheance: '' };
  editingReglementId: number | null = null;
  editReglement: any = {};

  loadReglements(): void {
    if (!this.purchaseOrderId) return;
    this.financialService.getReglementsByPurchaseOrder(this.purchaseOrderId).subscribe({
      next: (res: FinancialApiResponse<ReglementResponse[]>) => {
        if (res.success) this.reglements = res.data || [];
      },
      error: (e) => console.error('Error loading reglements', e)
    });
  }

  openAddReglementModal(): void {
    this.isAddingReglement = true;
  }

  saveNewReglement(): void {
    if (!this.purchaseOrderId) return;
    const payload: CreateReglementRequest = {
      nature: this.newReglement.nature,
      numero: this.newReglement.numero,
      montant: parseFloat(this.newReglement.montant) || 0,
      date: this.newReglement.date,
      banque: this.newReglement.banque || null,
      dateEcheance: this.newReglement.dateEcheance || null,
      type: 'Fournisseur',
      fournisseurId: this.purchaseOrderForm.get('fournisseurId')?.value || null,
      commandeAchatId: this.purchaseOrderId
    } as any;
    this.financialService.createReglement(payload).subscribe({
      next: (res: FinancialApiResponse<ReglementResponse>) => {
        if (res.success) {
          this.isAddingReglement = false;
          this.newReglement = { nature: 'Espece', numero: '', montant: 0, date: new Date().toISOString().substring(0,10), banque: '', dateEcheance: '' };
          this.loadReglements();
        }
      },
      error: (e) => console.error('Error creating reglement', e)
    });
  }

  cancelAddReglement(): void {
    this.isAddingReglement = false;
  }

  startEditReglement(r: ReglementResponse): void {
    this.editingReglementId = r.id;
    this.editReglement = { ...r, date: (r.date || '').substring(0,10), dateEcheance: r.dateEcheance ? r.dateEcheance.substring(0,10) : '' };
  }

  saveEditReglement(): void {
    if (this.editingReglementId == null) return;
    const payload: UpdateReglementRequest = {
      id: this.editingReglementId,
      nature: this.editReglement.nature,
      numero: this.editReglement.numero,
      montant: parseFloat(this.editReglement.montant) || 0,
      date: this.editReglement.date,
      banque: this.editReglement.banque || null,
      dateEcheance: this.editReglement.dateEcheance || null,
      type: 'Fournisseur',
      fournisseurId: this.purchaseOrderForm.get('fournisseurId')?.value || null,
      commandeAchatId: this.purchaseOrderId || null
    } as any;
    this.financialService.updateReglement(this.editingReglementId, payload).subscribe({
      next: (res: FinancialApiResponse<ReglementResponse>) => {
        if (res.success) {
          this.editingReglementId = null;
          this.loadReglements();
        }
      },
      error: (e) => console.error('Error updating reglement', e)
    });
  }

  cancelEditReglement(): void {
    this.editingReglementId = null;
  }

  confirmDeleteReglement(r: ReglementResponse): void {
    if (!confirm('Supprimer ce règlement ?')) return;
    this.financialService.deleteReglement(r.id).subscribe({
      next: (res: FinancialApiResponse<boolean>) => {
        if (res.success) this.loadReglements();
      },
      error: (e) => console.error('Error deleting reglement', e)
    });
  }

  reglementsTotal(): number {
    return (this.reglements || []).reduce((sum, r) => sum + (r.montant || 0), 0);
  }

  // Product search methods
  getProductDisplayName(productId: number | null): string {
    if (!productId) return '';
    const product = this.products.find(p => p.id === productId);
    return product ? `${product.reference} - ${product.designation}` : '';
  }

  // Get selected product IDs from all lines except the current one
  getSelectedProductIds(excludeIndex: number): number[] {
    const selectedIds: number[] = [];
    this.lignes.controls.forEach((line, index) => {
      if (index !== excludeIndex) {
        const produitId = line.get('produitId')?.value;
        if (produitId) {
          selectedIds.push(produitId);
        }
      }
    });
    return selectedIds;
  }

  onProductSearch(event: any, index: number): void {
    const searchTerm = event.target.value.toLowerCase();
    const selectedProductIds = this.getSelectedProductIds(index);
    
    if (searchTerm.length > 0) {
      this.filteredProducts[index] = this.products.filter(product => 
        !selectedProductIds.includes(product.id) && // Exclude already selected products
        (product.reference.toLowerCase().includes(searchTerm) || 
        product.designation.toLowerCase().includes(searchTerm))
      );
    } else {
      // When no search term, show all products except already selected ones
      this.filteredProducts[index] = this.products.filter(product => 
        !selectedProductIds.includes(product.id)
      );
    }
    this.showProductDropdownForIndex = index;
  }

  showProductDropdown(index: number): void {
    this.showProductDropdownForIndex = index;
    const selectedProductIds = this.getSelectedProductIds(index);
    
    // Show all products except already selected ones
    if (!this.filteredProducts[index] || this.filteredProducts[index].length === 0) {
      this.filteredProducts[index] = this.products.filter(product => 
        !selectedProductIds.includes(product.id)
      );
    }
  }

  hideProductDropdown(index: number, event: any): void {
    // Delay hiding to allow click events to register
    setTimeout(() => {
      this.showProductDropdownForIndex = null;
    }, 200);
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
  
  // Refresh filtered products for other lines to exclude this newly selected product
  this.refreshFilteredProducts();
}

// Refresh filtered products for all lines
refreshFilteredProducts(): void {
  if (this.showProductDropdownForIndex !== null) {
    // If a dropdown is currently shown, refresh its content
    this.showProductDropdown(this.showProductDropdownForIndex);
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

  getLineTotalTTC(line: any): number {
    const quantity = line.get('quantite')?.value || 0;
    const prixTTC = line.get('prixUnitaireTTC')?.value || 0;
    return quantity * prixTTC;
  }

  // Calculation methods for order summary
  calculateSubtotal(): number {
    let subtotal = 0;
    for (let i = 0; i < this.lignes.length; i++) {
      const line = this.lignes.at(i);
      const quantity = line.get('quantite')?.value || 0;
      const prixHT = line.get('prixUnitaireHT')?.value || 0;
      subtotal += quantity * prixHT;
    }
    return subtotal;
  }

  calculateTotal(): number {
    return this.calculateSubtotal();
  }

  calculateTotalWithVAT(): number {
    const totalHT = this.calculateTotal();
    return totalHT * 1.2; // 20% VAT
  }

  onSubmit(): void {
    if (this.purchaseOrderForm.valid) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const formValue = this.purchaseOrderForm.value;
      const currentUser = this.authService.getCurrentUser();
      const userName = currentUser ? `${currentUser.prenomEmploye} ${currentUser.nomEmploye}` : 'Utilisateur inconnu';
      
      const request: CreatePurchaseOrderRequest | UpdatePurchaseOrderRequest = {
        fournisseurId: formValue.fournisseurId,
        dateLivraisonPrevue: new Date(formValue.dateLivraisonPrevue),
        lignes: formValue.lignes.map((line: any) => ({
          produitId: line.produitId,
          quantite: line.quantite,
          prixUnitaireHT: line.prixUnitaireHT,
          tauxTVA: line.tauxTVA,
          prixUnitaireTTC: line.prixUnitaireTTC
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