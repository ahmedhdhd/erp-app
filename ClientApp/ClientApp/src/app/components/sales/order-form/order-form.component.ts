import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { SalesService } from '../../../services/sales.service';
import { ClientService } from '../../../services/client.service';
import { ProductService } from '../../../services/product.service';
import { SalesOrderResponse, CreateSalesOrderRequest, UpdateSalesOrderRequest, SalesApiResponse } from '../../../models/sales.models';
import { ClientResponse, ClientApiResponse, ClientListResponse } from '../../../models/client.models';
import { ProductResponse, ProductApiResponse, ProductListResponse } from '../../../models/product.models';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  // Form modes
  isEditMode = false;
  orderId: number | null = null;

  // Form
  orderForm: FormGroup;
  
  // Data
  clients: ClientResponse[] = [];
  products: ProductResponse[] = [];
  
  // Loading and error states
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Properties for searchable product dropdown
  showProductDropdownForIndex: number | null = null;
  filteredProducts: { [key: number]: ProductResponse[] } = {};
  
  // Status options
  statusOptions = [
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Confirmé', label: 'Confirmé' },
    { value: 'Expédié', label: 'Expédié' },
    { value: 'Livré', label: 'Livré' },
    { value: 'Annulé', label: 'Annulé' }
  ];

  constructor(
    private salesService: SalesService,
    private clientService: ClientService,
    private productService: ProductService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form
    this.orderForm = this.fb.group({
      clientId: [null, Validators.required],
      devisId: [null],
      modeLivraison: ['', Validators.required],
      conditionsPaiement: ['', Validators.required],
      lignes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProducts();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.orderId = +params['id'];
        this.loadOrder(this.orderId);
      } else {
        // Add an empty line for new orders
        this.addLine();
      }
    });
  }

  // Load order for editing
  loadOrder(id: number): void {
    this.isLoading = true;
    this.salesService.getSalesOrder(id).subscribe({
      next: (response: SalesApiResponse<SalesOrderResponse>) => {
        if (response.success && response.data) {
          const order = response.data;
          this.orderForm.patchValue({
            clientId: order.clientId,
            devisId: order.devisId,
            modeLivraison: order.modeLivraison,
            conditionsPaiement: order.conditionsPaiement
          });
          
          // Clear existing lines and add lines from the order
          this.lignes.clear();
          order.lignes.forEach(line => {
            const lineGroup = this.createLineFormGroup();
            lineGroup.patchValue({
              produitId: line.produitId,
              quantite: line.quantite,
              prixUnitaireHT: line.prixUnitaireHT,
              tauxTVA: line.tauxTVA,
              prixUnitaireTTC: line.prixUnitaireTTC
            });
            this.lignes.push(lineGroup);
          });
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement de la commande';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error loading order:', error);
      }
    });
  }

  // Load clients for dropdown
  loadClients(): void {
    this.clientService.getClients(1, 1000).subscribe({
      next: (response: ClientApiResponse<ClientListResponse>) => {
        if (response.success && response.data) {
          this.clients = response.data.clients;
        }
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  // Load products for dropdown
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
      error: (error: any) => {
        console.error('Error loading products:', error);
      }
    });
  }

  // Form getters
  get lignes(): FormArray {
    return this.orderForm.get('lignes') as FormArray;
  }

  // Create a new line form group with HT and TTC price fields
createLineFormGroup(): FormGroup {
  const group = this.fb.group({
    produitId: [null, Validators.required],
    quantite: [1, [Validators.required, Validators.min(1)]],
    prixUnitaireHT: [0, [Validators.required, Validators.min(0)]],
    tauxTVA: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    prixUnitaireTTC: [0] // Remove disabled state for better reactivity
  });
  
  // Add value change listeners with debounce to prevent excessive calculations
  group.get('prixUnitaireHT')?.valueChanges.subscribe(value => {
    console.log('prixUnitaireHT changed in sales form:', value);
    setTimeout(() => this.calculateTTCPrice(group), 0);
  });
  
  group.get('tauxTVA')?.valueChanges.subscribe(value => {
    console.log('tauxTVA changed in sales form:', value);
    setTimeout(() => this.calculateTTCPrice(group), 0);
  });
  
  return group;
}

  // Add a new line
  addLine(): void {
    this.lignes.push(this.createLineFormGroup());
  }

  // Remove a line
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
    // Set all the product-related values using patchValue for better form control
    lineGroup.patchValue({
      produitId: product.id,
      prixUnitaireHT: product.prixVenteHT || 0,
      tauxTVA: product.tauxTVA || 20  // Default to 20% if not specified
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

// Enhanced calculateTTCPrice method with better error handling
calculateTTCPrice(lineGroup: FormGroup): void {
  const prixHT = parseFloat(lineGroup.get('prixUnitaireHT')?.value) || 0;
  const tauxTVA = parseFloat(lineGroup.get('tauxTVA')?.value) || 0;
  const prixTTC = prixHT * (1 + tauxTVA / 100);
  
  console.log('Calculating TTC in sales form:', { prixHT, tauxTVA, prixTTC });
  
  // Round to 3 decimal places to avoid floating point precision issues
  const roundedPrixTTC = Math.round(prixTTC * 1000) / 1000;
  
  lineGroup.get('prixUnitaireTTC')?.setValue(roundedPrixTTC, { emitEvent: false });
}

  getLineTotalTTC(line: any): number {
    const quantity = line.get('quantite')?.value || 0;
    const prixTTC = line.get('prixUnitaireTTC')?.value || 0;
    return quantity * prixTTC;
  }

  // Get product details for a line
  getProductDetails(produitId: number): ProductResponse | undefined {
    return this.products.find(p => p.id === produitId);
  }

  // Calculate line total (HT)
  calculateLineTotal(line: AbstractControl): number {
    const quantite = line.get('quantite')?.value || 0;
    const prixUnitaireHT = line.get('prixUnitaireHT')?.value || 0;
    return quantite * prixUnitaireHT;
  }

  // Calculate subtotal (before discount)
  calculateSubtotal(): number {
    return this.lignes.controls.reduce((total, line) => {
      return total + this.calculateLineTotal(line);
    }, 0);
  }

  // Calculate total (no discount for orders)
  calculateTotal(): number {
    return this.calculateSubtotal();
  }

  // Calculate total with VAT (20%)
  calculateTotalWithVAT(): number {
    const total = this.calculateTotal();
    return total * 1.2; // 20% VAT
  }

  // Form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
    }
    return '';
  }

  isLineFieldInvalid(lineIndex: number, fieldName: string): boolean {
    const line = this.lignes.at(lineIndex);
    const field = line.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getLineFieldErrorMessage(lineIndex: number, fieldName: string): string {
    const line = this.lignes.at(lineIndex);
    const field = line.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['min']) return 'La valeur doit être supérieure ou égale à ' + field.errors['min'].min;
    }
    return '';
  }

  // Form actions
  clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  onCancel(): void {
    this.router.navigate(['/sales/orders']);
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.isSubmitting = true;
      this.clearMessages();

      // Prepare request data
      const formValue = this.orderForm.value;
      const request: CreateSalesOrderRequest | UpdateSalesOrderRequest = {
        clientId: formValue.clientId,
        modeLivraison: formValue.modeLivraison,
        conditionsPaiement: formValue.conditionsPaiement,
        lignes: formValue.lignes.map((line: any) => ({
          produitId: line.produitId,
          quantite: line.quantite,
          prixUnitaireHT: line.prixUnitaireHT,
          tauxTVA: line.tauxTVA,
          prixUnitaireTTC: line.prixUnitaireTTC
        }))
      };

      // Add devisId if provided
      if (formValue.devisId) {
        (request as any).devisId = formValue.devisId;
      }

      if (this.isEditMode && this.orderId) {
        this.salesService.updateSalesOrder(this.orderId, request as UpdateSalesOrderRequest).subscribe({
          next: (response: SalesApiResponse<SalesOrderResponse>) => {
            this.isSubmitting = false;
            if (response.success) {
              this.successMessage = 'Commande mise à jour avec succès';
              setTimeout(() => {
                this.router.navigate(['/sales/orders']);
              }, 2000);
            } else {
              this.errorMessage = response.message || 'Erreur lors de la mise à jour de la commande';
            }
          },
          error: (error) => {
            this.isSubmitting = false;
            this.errorMessage = 'Erreur de connexion au serveur';
            console.error('Error updating order:', error);
          }
        });
      } else {
        this.salesService.createSalesOrder(request as CreateSalesOrderRequest).subscribe({
          next: (response: SalesApiResponse<SalesOrderResponse>) => {
            this.isSubmitting = false;
            if (response.success) {
              this.successMessage = 'Commande créée avec succès';
              setTimeout(() => {
                this.router.navigate(['/sales/orders']);
              }, 2000);
            } else {
              this.errorMessage = response.message || 'Erreur lors de la création de la commande';
            }
          },
          error: (error) => {
            this.isSubmitting = false;
            this.errorMessage = 'Erreur de connexion au serveur';
            console.error('Error creating order:', error);
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.orderForm.markAllAsTouched();
      this.lignes.controls.forEach(line => {
        line.markAllAsTouched();
      });
    }
  }
}