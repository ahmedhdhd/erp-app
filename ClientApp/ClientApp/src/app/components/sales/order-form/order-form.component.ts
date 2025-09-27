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
            this.lignes.push(this.fb.group({
              produitId: [line.produitId, Validators.required],
              quantite: [line.quantite, [Validators.required, Validators.min(1)]],
              prixUnitaire: [line.prixUnitaire, [Validators.required, Validators.min(0)]]
            }));
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
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isLineFieldInvalid(lineIndex: number, fieldName: string): boolean {
    const line = this.lignes.at(lineIndex);
    const field = line.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
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
    this.router.navigate(['/sales/orders']);
  }

  // Submit form
  onSubmit(): void {
    if (this.orderForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.orderForm.markAllAsTouched();
      this.lignes.controls.forEach(line => line.markAllAsTouched());
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    // Prepare request data
    const formData = this.orderForm.value;
    const request: CreateSalesOrderRequest | UpdateSalesOrderRequest = {
      clientId: formData.clientId,
      devisId: formData.devisId || undefined,
      modeLivraison: formData.modeLivraison,
      conditionsPaiement: formData.conditionsPaiement,
      lignes: formData.lignes.map((line: any) => ({
        produitId: line.produitId,
        quantite: line.quantite,
        prixUnitaire: line.prixUnitaire
      }))
    };

    if (this.isEditMode && this.orderId) {
      // Update existing order
      const updateRequest = { ...request, id: this.orderId } as UpdateSalesOrderRequest;
      this.salesService.updateSalesOrder(this.orderId, updateRequest).subscribe({
        next: (response: SalesApiResponse<SalesOrderResponse>) => {
          if (response.success) {
            this.successMessage = 'Commande mise à jour avec succès';
            setTimeout(() => this.router.navigate(['/sales/orders']), 2000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la mise à jour de la commande';
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          this.isSubmitting = false;
          console.error('Error updating order:', error);
        }
      });
    } else {
      // Create new order
      this.salesService.createSalesOrder(request as CreateSalesOrderRequest).subscribe({
        next: (response: SalesApiResponse<SalesOrderResponse>) => {
          if (response.success) {
            this.successMessage = 'Commande créée avec succès';
            setTimeout(() => this.router.navigate(['/sales/orders']), 2000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la création de la commande';
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur de connexion au serveur';
          this.isSubmitting = false;
          console.error('Error creating order:', error);
        }
      });
    }
  }
}