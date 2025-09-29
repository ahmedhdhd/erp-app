import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { SalesService } from '../../../services/sales.service';
import { ClientService } from '../../../services/client.service';
import { ProductService } from '../../../services/product.service';
import { QuoteResponse, CreateQuoteRequest, UpdateQuoteRequest, SalesApiResponse } from '../../../models/sales.models';
import { ClientResponse, ClientApiResponse, ClientListResponse } from '../../../models/client.models';
import { ProductResponse, ProductApiResponse, ProductListResponse } from '../../../models/product.models';

@Component({
  selector: 'app-quote-form',
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.css']
})
export class QuoteFormComponent implements OnInit {
  // Form modes
  isEditMode = false;
  quoteId: number | null = null;

  // Form
  quoteForm: FormGroup;
  
  // Data
  clients: ClientResponse[] = [];
  products: ProductResponse[] = [];
  
  // Properties for searchable product dropdown
  showProductDropdownForIndex: number | null = null;
  filteredProducts: { [key: number]: ProductResponse[] } = {};
  
  // Loading and error states
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Status options
  statusOptions = [
    { value: 'Brouillon', label: 'Brouillon' },
    { value: 'Envoyé', label: 'Envoyé' },
    { value: 'Accepté', label: 'Accepté' },
    { value: 'Rejeté', label: 'Rejeté' }
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
    this.quoteForm = this.fb.group({
      clientId: [null, Validators.required],
      dateExpiration: [null, Validators.required],
      remise: [0, [Validators.min(0)]],
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
        this.quoteId = +params['id'];
        // Wait for products to be loaded before loading the quote
        const checkProductsLoaded = setInterval(() => {
          if (this.products.length > 0) {
            clearInterval(checkProductsLoaded);
            if (this.quoteId !== null) {
              this.loadQuote(this.quoteId);
            }
          }
        }, 100);
      } else {
        // Add an empty line for new quotes
        this.addLine();
      }
    });
  }

  // Load quote for editing
  loadQuote(id: number): void {
    this.isLoading = true;
    this.salesService.getQuote(id).subscribe({
      next: (response: SalesApiResponse<QuoteResponse>) => {
        if (response.success && response.data) {
          const quote = response.data;
          this.quoteForm.patchValue({
            clientId: quote.clientId,
            dateExpiration: new Date(quote.dateExpiration).toISOString().split('T')[0],
            remise: quote.remise
          });
          
          // Clear existing lines and add lines from the quote
          this.lignes.clear();
          quote.lignes.forEach(line => {
            const lineGroup = this.createLineFormGroup();
            lineGroup.patchValue({
              produitId: line.produitId,
              quantite: line.quantite,
              prixUnitaireHT: line.prixUnitaireHT,
              tauxTVA: line.tauxTVA,
              prixUnitaireTTC: line.prixUnitaireTTC
            });
            
            // Trigger the TTC calculation to ensure it's properly updated
            setTimeout(() => {
              this.calculateTTCPrice(lineGroup);
            }, 0);
            
            this.lignes.push(lineGroup);
          });
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement du devis';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error loading quote:', error);
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
      error: (error) => {
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
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  // Form getters
  get lignes(): FormArray {
    return this.quoteForm.get('lignes') as FormArray;
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
      setTimeout(() => this.calculateTTCPrice(group), 0);
    });
    
    group.get('tauxTVA')?.valueChanges.subscribe(value => {
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
    } else {
      // If it's the last line, just reset it
      const lineGroup = this.createLineFormGroup();
      this.lignes.setControl(0, lineGroup);
    }
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

  selectProduct(index: number, product: ProductResponse): void {
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
      }, 0);
    }
    
    // Hide the dropdown
    this.showProductDropdownForIndex = null;
    
    // Clear the filtered products for this index
    if (this.filteredProducts[index]) {
      delete this.filteredProducts[index];
    }
  }

  // Enhanced calculateTTCPrice method with better error handling
  calculateTTCPrice(lineGroup: FormGroup): void {
    const prixHT = parseFloat(lineGroup.get('prixUnitaireHT')?.value) || 0;
    const tauxTVA = parseFloat(lineGroup.get('tauxTVA')?.value) || 0;
    const prixTTC = prixHT * (1 + tauxTVA / 100);
    
    // Round to 3 decimal places to avoid floating point precision issues
    const roundedPrixTTC = Math.round(prixTTC * 1000) / 1000;
    
    lineGroup.get('prixUnitaireTTC')?.setValue(roundedPrixTTC, { emitEvent: false });
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

  // Calculate discount amount
  calculateDiscount(): number {
    const subtotal = this.calculateSubtotal();
    const discountPercent = this.quoteForm.get('remise')?.value || 0;
    return subtotal * (discountPercent / 100);
  }

  // Calculate total (after discount)
  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    return subtotal - discount;
  }

  // Calculate total with VAT (20%)
  calculateTotalWithVAT(): number {
    const total = this.calculateTotal();
    return total * 1.2; // 20% VAT
  }

  // Get line total TTC
  getLineTotalTTC(line: any): number {
    const quantity = line.get('quantite')?.value || 0;
    const prixTTC = line.get('prixUnitaireTTC')?.value || 0;
    return quantity * prixTTC;
  }

  // Form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.quoteForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
      if (field.errors['min']) return 'La valeur doit être supérieure ou égale à ' + field.errors['min'].min;
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
    this.router.navigate(['/sales/quotes']);
  }

  onSubmit(): void {
    if (this.quoteForm.valid) {
      this.isSubmitting = true;
      this.clearMessages();

      // Prepare request data
      const formValue = this.quoteForm.value;
      const request: CreateQuoteRequest | UpdateQuoteRequest = {
        clientId: formValue.clientId,
        dateExpiration: new Date(formValue.dateExpiration),
        remise: formValue.remise,
        lignes: formValue.lignes.map((line: any) => ({
          produitId: line.produitId,
          quantite: line.quantite,
          prixUnitaireHT: line.prixUnitaireHT,
          tauxTVA: line.tauxTVA,
          prixUnitaireTTC: line.prixUnitaireTTC
        }))
      };

      if (this.isEditMode && this.quoteId) {
        this.salesService.updateQuote(this.quoteId, { ...request, id: this.quoteId } as UpdateQuoteRequest).subscribe({
          next: (response: SalesApiResponse<QuoteResponse>) => {
            if (response.success) {
              this.successMessage = 'Devis mis à jour avec succès';
              setTimeout(() => {
                this.router.navigate(['/sales/quotes']);
              }, 2000);
            } else {
              this.errorMessage = response.message || 'Erreur lors de la mise à jour du devis';
            }
            this.isSubmitting = false;
          },
          error: (error) => {
            this.errorMessage = 'Erreur de connexion au serveur';
            this.isSubmitting = false;
            console.error('Error updating quote:', error);
          }
        });
      } else {
        this.salesService.createQuote(request as CreateQuoteRequest).subscribe({
          next: (response: SalesApiResponse<QuoteResponse>) => {
            if (response.success) {
              this.successMessage = 'Devis créé avec succès';
              setTimeout(() => {
                this.router.navigate(['/sales/quotes']);
              }, 2000);
            } else {
              this.errorMessage = response.message || 'Erreur lors de la création du devis';
            }
            this.isSubmitting = false;
          },
          error: (error) => {
            this.errorMessage = 'Erreur de connexion au serveur';
            this.isSubmitting = false;
            console.error('Error creating quote:', error);
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.quoteForm.markAllAsTouched();
    }
  }
}
