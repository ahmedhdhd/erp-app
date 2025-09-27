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
        this.loadQuote(this.quoteId);
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
            this.lignes.push(this.fb.group({
              produitId: [line.produitId, Validators.required],
              quantite: [line.quantite, [Validators.required, Validators.min(1)]],
              prixUnitaire: [line.prixUnitaire, [Validators.required, Validators.min(0)]]
            }));
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

  // Add a new line
  addLine(): void {
    this.lignes.push(this.fb.group({
      produitId: [null, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  // Remove a line
  removeLine(index: number): void {
    if (this.lignes.length > 1) {
      this.lignes.removeAt(index);
    } else {
      // If it's the last line, just reset it
      this.lignes.at(index).reset({
        produitId: null,
        quantite: 1,
        prixUnitaire: 0
      });
    }
  }

  // Get product details for a line
  getProductDetails(produitId: number): ProductResponse | undefined {
    return this.products.find(p => p.id === produitId);
  }

  // Calculate line total
  calculateLineTotal(line: AbstractControl): number {
    const quantite = line.get('quantite')?.value || 0;
    const prixUnitaire = line.get('prixUnitaire')?.value || 0;
    return quantite * prixUnitaire;
  }

  // Calculate subtotal (before discount)
  calculateSubtotal(): number {
    return this.lignes.controls.reduce((total, line) => {
      return total + this.calculateLineTotal(line);
    }, 0);
  }

  // Calculate total discount
  calculateDiscount(): number {
    const subtotal = this.calculateSubtotal();
    const discountRate = this.quoteForm.get('remise')?.value || 0;
    return subtotal * (discountRate / 100);
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

  // Form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isLineFieldInvalid(lineIndex: number, fieldName: string): boolean {
    const line = this.lignes.at(lineIndex);
    const field = line.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.quoteForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['min']) return 'La valeur doit être positive';
    }
    return '';
  }

  getLineFieldErrorMessage(lineIndex: number, fieldName: string): string {
    const line = this.lignes.at(lineIndex);
    const field = line.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['min']) return 'La valeur doit être positive';
    }
    return '';
  }

  // Clear messages
  clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  // Cancel and go back
  onCancel(): void {
    this.router.navigate(['/sales/quotes']);
  }

  // Submit form
  onSubmit(): void {
    if (this.quoteForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.quoteForm.markAllAsTouched();
      this.lignes.controls.forEach(line => line.markAllAsTouched());
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    // Prepare request data
    const formData = this.quoteForm.value;
    const request: CreateQuoteRequest | UpdateQuoteRequest = {
      clientId: formData.clientId,
      dateExpiration: new Date(formData.dateExpiration),
      remise: formData.remise,
      lignes: formData.lignes.map((line: any) => ({
        produitId: line.produitId,
        quantite: line.quantite,
        prixUnitaire: line.prixUnitaire
      }))
    };

    if (this.isEditMode && this.quoteId) {
      // Update existing quote
      const updateRequest = { ...request, id: this.quoteId } as UpdateQuoteRequest;
      this.salesService.updateQuote(this.quoteId, updateRequest).subscribe({
        next: (response: SalesApiResponse<QuoteResponse>) => {
          if (response.success) {
            this.successMessage = 'Devis mis à jour avec succès';
            setTimeout(() => this.router.navigate(['/sales/quotes']), 2000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la mise à jour du devis';
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          this.isSubmitting = false;
          console.error('Error updating quote:', error);
        }
      });
    } else {
      // Create new quote
      this.salesService.createQuote(request as CreateQuoteRequest).subscribe({
        next: (response: SalesApiResponse<QuoteResponse>) => {
          if (response.success) {
            this.successMessage = 'Devis créé avec succès';
            setTimeout(() => this.router.navigate(['/sales/quotes']), 2000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la création du devis';
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          this.isSubmitting = false;
          console.error('Error creating quote:', error);
        }
      });
    }
  }
}