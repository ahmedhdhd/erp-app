import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CategoryResponse,
  VariantFormData,
  ProductFormData,
  ProductStatus,
  ProductUnit,
  ProductApiResponse
} from '../../../models/product.models';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  categories: CategoryResponse[] = [];
  isEditing = false;
  productId?: number;
  loading = false;
  saving = false;
  
  // Form validation
  submitted = false;
  errors: { [key: string]: string[] } = {};
  
  // Enums for template
  ProductStatus = ProductStatus;
  ProductUnit = ProductUnit;
  
  // Available options (loaded from API)
  statusOptions: { value: string, label: string }[] = [];
  unitOptions: { value: string, label: string }[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProductStatuses();
    this.loadProductUnits();
    this.checkRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeForm(): void {
    this.productForm = this.fb.group({
      reference: ['', [Validators.required, Validators.maxLength(50)]],
      designation: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      categorieId: [null, [Validators.required]],
      sousCategorie: ['', [Validators.maxLength(100)]],
      prixAchat: [0, [Validators.required, Validators.min(0)]],
      prixVente: [0, [Validators.required, Validators.min(0)]],
      prixVenteMin: [0, [Validators.min(0)]],
      // Essential price fields (HT values)
      tauxTVA: [19, [Validators.required, Validators.min(0), Validators.max(100)]],
      prixAchatHT: [0, [Validators.min(0)]],
      prixVenteHT: [0, [Validators.min(0)]],
      prixVenteMinHT: [0, [Validators.min(0)]],
      // Legacy fields (to be removed gradually)
      prixAchatTTC: [0, [Validators.min(0)]],
      prixVenteTTC: [0, [Validators.min(0)]],
      prixVenteMinTTC: [0, [Validators.min(0)]],
      unite: [ProductUnit.PIECE, [Validators.required]],
      stockActuel: [0, [Validators.required, Validators.min(0)]],
      stockMinimum: [0, [Validators.required, Validators.min(0)]],
      stockMaximum: [100, [Validators.min(1)]], // Set to 100 by default to avoid validation error
      statut: [ProductStatus.ACTIF, [Validators.required]],
      variantes: this.fb.array([])
    });

    // Add form value change listeners
    this.setupFormValidation();
    this.setupTVACalculations();
    
    // Initialize TTC values based on default HT values and TVA rate
    setTimeout(() => {
      this.calculateTTCFromHT(19);
    }, 0);
  }

  private setupFormValidation(): void {
    // Ensure minimum price is not greater than selling price
    this.productForm.get('prixVenteMin')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(minPrice => {
      const sellingPrice = this.productForm.get('prixVente')?.value;
      if (minPrice && sellingPrice && minPrice > sellingPrice) {
        this.productForm.get('prixVenteMin')?.setErrors({ 'minPriceGreaterThanPrice': true });
      }
    });

    // Ensure purchase price is not greater than selling price
    this.productForm.get('prixAchat')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(purchasePrice => {
      const sellingPrice = this.productForm.get('prixVente')?.value;
      if (purchasePrice && sellingPrice && purchasePrice > sellingPrice) {
        this.addWarning('Le prix d\'achat est supérieur au prix de vente.');
      }
    });

    // Ensure maximum stock is greater than minimum stock
    this.productForm.get('stockMaximum')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.validateStockLevels();
    });

    // Also validate when minimum stock changes
    this.productForm.get('stockMinimum')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.validateStockLevels();
    });
  }

  private setupTVACalculations(): void {
    // Auto-calculate TTC from HT when TVA rate changes
    this.productForm.get('tauxTVA')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(tauxTVA => {
      this.calculateTTCFromHT(tauxTVA);
    });

    // Auto-calculate TTC when HT changes
    this.productForm.get('prixAchatHT')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value !== null && value !== undefined) {
        const tauxTVA = this.productForm.get('tauxTVA')?.value || 19;
        this.calculateTTCFromHT(tauxTVA);
        // Also update the base price field
        this.productForm.get('prixAchat')?.setValue(value, { emitEvent: false });
      }
    });

    this.productForm.get('prixVenteHT')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value !== null && value !== undefined) {
        const tauxTVA = this.productForm.get('tauxTVA')?.value || 19;
        this.calculateTTCFromHT(tauxTVA);
        // Also update the base price field
        this.productForm.get('prixVente')?.setValue(value, { emitEvent: false });
      }
    });

    this.productForm.get('prixVenteMinHT')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value !== null && value !== undefined) {
        const tauxTVA = this.productForm.get('tauxTVA')?.value || 19;
        this.calculateTTCFromHT(tauxTVA);
        // Also update the base price field
        this.productForm.get('prixVenteMin')?.setValue(value, { emitEvent: false });
      }
    });
  
    // Also sync base price fields to HT fields when they change
    this.productForm.get('prixAchat')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value !== null && value !== undefined) {
        this.productForm.get('prixAchatHT')?.setValue(value, { emitEvent: false });
        const tauxTVA = this.productForm.get('tauxTVA')?.value || 19;
        this.calculateTTCFromHT(tauxTVA);
      }
    });

    this.productForm.get('prixVente')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value !== null && value !== undefined) {
        this.productForm.get('prixVenteHT')?.setValue(value, { emitEvent: false });
        const tauxTVA = this.productForm.get('tauxTVA')?.value || 19;
        this.calculateTTCFromHT(tauxTVA);
      }
    });

    this.productForm.get('prixVenteMin')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value !== null && value !== undefined) {
        this.productForm.get('prixVenteMinHT')?.setValue(value, { emitEvent: false });
        const tauxTVA = this.productForm.get('tauxTVA')?.value || 19;
        this.calculateTTCFromHT(tauxTVA);
      }
    });
}

private calculateTTCFromHT(tauxTVA: number): void {
  const multiplier = 1 + (tauxTVA / 100);
  
  const prixAchatHT = this.productForm.get('prixAchatHT')?.value || 0;
  const prixVenteHT = this.productForm.get('prixVenteHT')?.value || 0;
  const prixVenteMinHT = this.productForm.get('prixVenteMinHT')?.value || 0;

  this.productForm.get('prixAchatTTC')?.setValue(parseFloat((prixAchatHT * multiplier).toFixed(2)), { emitEvent: false });
  this.productForm.get('prixVenteTTC')?.setValue(parseFloat((prixVenteHT * multiplier).toFixed(2)), { emitEvent: false });
  this.productForm.get('prixVenteMinTTC')?.setValue(parseFloat((prixVenteMinHT * multiplier).toFixed(2)), { emitEvent: false });
  
  // Also update the base price fields
  this.productForm.get('prixAchat')?.setValue(prixAchatHT, { emitEvent: false });
  this.productForm.get('prixVente')?.setValue(prixVenteHT, { emitEvent: false });
  this.productForm.get('prixVenteMin')?.setValue(prixVenteMinHT, { emitEvent: false });
}

  calculateHTFromTTC(field: string): void {
    const tauxTVA = this.productForm.get('tauxTVA')?.value || 19;
    const divisor = 1 + (tauxTVA / 100);
    
    const ttcValue = this.productForm.get(field + 'TTC')?.value || 0;
    const htValue = parseFloat((ttcValue / divisor).toFixed(2));
    
    this.productForm.get(field + 'HT')?.setValue(htValue, { emitEvent: false });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  private validateStockLevels(): void {
    const minStock = this.productForm.get('stockMinimum')?.value || 0;
    const maxStock = this.productForm.get('stockMaximum')?.value || 0;
    
    // Clear existing errors first
    this.productForm.get('stockMaximum')?.setErrors(null);
    
    // Validate that max stock is greater than min stock
    if (maxStock > 0 && minStock >= 0 && maxStock <= minStock) {
      this.productForm.get('stockMaximum')?.setErrors({ 'maxStockLessThanMin': true });
    }
  }

  private checkRouteParams(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.productId = +params['id'];
        this.isEditing = true;
        this.loadProduct();
      }
    });
  }

  // ==================== DATA LOADING ====================

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (response: ProductApiResponse<CategoryResponse[]>) => {
        if (response.success && response.data) {
          this.categories = response.data.filter(c => c.estActif);
        }
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.addError('Erreur lors du chargement des catégories');
      }
    });
  }

  private loadProductStatuses(): void {
    this.productService.getProductStatuses().subscribe({
      next: (response: ProductApiResponse<string[]>) => {
        if (response.success && response.data) {
          this.statusOptions = response.data.map(status => ({
            value: status,
            label: status
          }));
        }
      },
      error: (error: any) => {
        console.error('Error loading statuses:', error);
        // Fall back to hardcoded values
        this.statusOptions = [
          { value: ProductStatus.ACTIF, label: 'Actif' },
          { value: ProductStatus.INACTIF, label: 'Inactif' },
          { value: ProductStatus.DISCONTINUE, label: 'Discontinué' },
          { value: ProductStatus.RUPTURE, label: 'Rupture' }
        ];
      }
    });
  }

  private loadProductUnits(): void {
    this.productService.getProductUnits().subscribe({
      next: (response: ProductApiResponse<string[]>) => {
        if (response.success && response.data) {
          this.unitOptions = response.data.map(unit => ({
            value: unit,
            label: unit
          }));
        }
      },
      error: (error: any) => {
        console.error('Error loading units:', error);
        // Fall back to hardcoded values
        this.unitOptions = [
          { value: ProductUnit.PIECE, label: 'Pièce' },
          { value: ProductUnit.KG, label: 'Kg' },
          { value: ProductUnit.LITRE, label: 'Litre' },
          { value: ProductUnit.METRE, label: 'Mètre' },
          { value: ProductUnit.METRE_CARRE, label: 'M²' },
          { value: ProductUnit.METRE_CUBE, label: 'M³' },
          { value: ProductUnit.BOITE, label: 'Boîte' },
          { value: ProductUnit.PAQUET, label: 'Paquet' }
        ];
      }
    });
  }

  private loadProduct(): void {
    if (!this.productId) return;

    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (response: ProductApiResponse<ProductResponse>) => {
        if (response.success && response.data) {
          this.populateForm(response.data);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.addError('Erreur lors du chargement du produit');
        this.loading = false;
      }
    });
  }

  private populateForm(product: ProductResponse): void {
    // Set the form values
    this.productForm.patchValue({
      reference: product.reference,
      designation: product.designation,
      description: product.description,
      categorieId: product.categorieId,
      sousCategorie: product.sousCategorie,
      prixAchat: product.prixAchat,
      prixVente: product.prixVente,
      prixVenteMin: product.prixVenteMin,
      // Essential price fields (HT values)
      tauxTVA: product.tauxTVA,
      prixAchatHT: product.prixAchatHT,
      prixVenteHT: product.prixVenteHT,
      prixVenteMinHT: product.prixVenteMinHT,
      // Calculated TTC values
      prixAchatTTC: product.prixAchatTTC,
      prixVenteTTC: product.prixVenteTTC,
      prixVenteMinTTC: product.prixVenteMinTTC,
      // Legacy fields
      unite: product.unite,
      stockActuel: product.stockActuel,
      stockMinimum: product.stockMinimum,
      stockMaximum: product.stockMaximum,
      statut: product.statut
    });

    // Ensure synchronization between HT and base price fields
    setTimeout(() => {
      this.productForm.get('prixAchat')?.setValue(product.prixAchatHT, { emitEvent: false });
      this.productForm.get('prixVente')?.setValue(product.prixVenteHT, { emitEvent: false });
      this.productForm.get('prixVenteMin')?.setValue(product.prixVenteMinHT, { emitEvent: false });
    }, 0);

    // Load variants if any
    if (product.variantes && product.variantes.length > 0) {
      const variantArray = this.productForm.get('variantes') as FormArray;
      product.variantes.forEach(variant => {
        variantArray.push(this.createVariantFormGroup({
          id: variant.id,
          taille: variant.taille,
          couleur: variant.couleur,
          referenceVariant: variant.referenceVariant,
          stockActuel: variant.stockActuel
        }));
      });
    }
  }

  // ==================== VARIANT MANAGEMENT ====================

  get variantesFormArray(): FormArray {
    return this.productForm.get('variantes') as FormArray;
  }

  createVariantFormGroup(variant?: VariantFormData): FormGroup {
    return this.fb.group({
      id: [variant?.id || null],
      taille: [variant?.taille || '', [Validators.maxLength(50)]],
      couleur: [variant?.couleur || '', [Validators.maxLength(50)]],
      referenceVariant: [variant?.referenceVariant || '', [Validators.maxLength(50)]],
      stockActuel: [variant?.stockActuel || 0, [Validators.required, Validators.min(0)]]
    });
  }

  addVariant(): void {
    this.variantesFormArray.push(this.createVariantFormGroup());
  }

  removeVariant(index: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette variante ?')) {
      this.variantesFormArray.removeAt(index);
    }
  }

  // ==================== FORM SUBMISSION ====================

  onSubmit(): void {
    this.submitted = true;
    this.errors = {};

    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.addError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (this.isEditing) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  private createProduct(): void {
    const formData = this.productForm.value;
    const request: CreateProductRequest = {
      reference: formData.reference,
      designation: formData.designation,
      description: formData.description,
      categorieId: formData.categorieId,
      sousCategorie: formData.sousCategorie,
      prixAchat: formData.prixAchat,
      prixVente: formData.prixVente,
      prixVenteMin: formData.prixVenteMin,
      // Essential price fields (HT values)
      tauxTVA: formData.tauxTVA,
      prixAchatHT: formData.prixAchatHT,
      prixVenteHT: formData.prixVenteHT,
      prixVenteMinHT: formData.prixVenteMinHT,
      // Legacy fields (to be removed gradually)
      prixAchatTTC: formData.prixAchatTTC,
      prixVenteTTC: formData.prixVenteTTC,
      prixVenteMinTTC: formData.prixVenteMinTTC,
      unite: formData.unite,
      stockActuel: formData.stockActuel,
      stockMinimum: formData.stockMinimum,
      stockMaximum: formData.stockMaximum,
      statut: formData.statut,
      variantes: formData.variantes
    };

    this.saving = true;
    this.productService.createProduct(request).subscribe({
      next: (response: ProductApiResponse<ProductResponse>) => {
        if (response.success) {
          this.addSuccess('Produit créé avec succès');
          this.router.navigate(['/products']);
        } else {
          this.handleApiErrors(response.errors);
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Error creating product:', error);
        this.addError('Erreur lors de la création du produit');
        this.saving = false;
      }
    });
  }

  private updateProduct(): void {
    if (!this.productId) return;

    const formData = this.productForm.value;
    const request: UpdateProductRequest = {
      id: this.productId,
      reference: formData.reference,
      designation: formData.designation,
      description: formData.description,
      categorieId: formData.categorieId,
      sousCategorie: formData.sousCategorie,
      prixAchat: formData.prixAchat,
      prixVente: formData.prixVente,
      prixVenteMin: formData.prixVenteMin,
      // Essential price fields (HT values)
      tauxTVA: formData.tauxTVA,
      prixAchatHT: formData.prixAchatHT,
      prixVenteHT: formData.prixVenteHT,
      prixVenteMinHT: formData.prixVenteMinHT,
      // Legacy fields (to be removed gradually)
      prixAchatTTC: formData.prixAchatTTC,
      prixVenteTTC: formData.prixVenteTTC,
      prixVenteMinTTC: formData.prixVenteMinTTC,
      unite: formData.unite,
      stockActuel: formData.stockActuel,
      stockMinimum: formData.stockMinimum,
      stockMaximum: formData.stockMaximum,
      statut: formData.statut,
      variantes: formData.variantes
    };

    this.saving = true;
    this.productService.updateProduct(this.productId, request).subscribe({
      next: (response: ProductApiResponse<ProductResponse>) => {
        if (response.success) {
          this.addSuccess('Produit modifié avec succès');
          this.router.navigate(['/products']);
        } else {
          this.handleApiErrors(response.errors);
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Error updating product:', error);
        this.addError('Erreur lors de la modification du produit');
        this.saving = false;
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return permission.split(',').some(role => this.authService.hasRole(role.trim()));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched || this.submitted)) {
      const errors = field.errors;
      
      if (errors['required']) return `${this.getFieldLabel(fieldName)} est obligatoire`;
      if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
      if (errors['min']) return `${this.getFieldLabel(fieldName)} doit être supérieur ou égal à ${errors['min'].min}`;
      if (errors['minPriceGreaterThanPrice']) return 'Le prix minimum ne peut pas être supérieur au prix de vente';
      if (errors['maxStockLessThanMin']) return 'Le stock maximum doit être supérieur au stock minimum';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'reference': 'La référence',
      'designation': 'La désignation',
      'description': 'La description',
      'categorieId': 'La catégorie',
      'prixAchat': 'Le prix d\'achat',
      'prixVente': 'Le prix de vente',
      'prixVenteMin': 'Le prix de vente minimum',
      'unite': 'L\'unité',
      'stockActuel': 'Le stock actuel',
      'stockMinimum': 'Le stock minimum',
      'stockMaximum': 'Le stock maximum',
      'statut': 'Le statut'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
    });
  }

  private handleApiErrors(errors: string[]): void {
    if (errors && errors.length > 0) {
      errors.forEach(error => this.addError(error));
    } else {
      this.addError('Une erreur est survenue lors de l\'opération');
    }
  }

  private addError(message: string): void {
    if (!this.errors['general']) this.errors['general'] = [];
    this.errors['general'].push(message);
  }

  private addSuccess(message: string): void {
    // Could implement a toast service here
    alert(message);
  }

  private addWarning(message: string): void {
    // Could implement a toast service here
    console.warn(message);
  }

  calculateMargin(): number {
    const purchasePrice = this.productForm.get('prixAchat')?.value || 0;
    const sellingPrice = this.productForm.get('prixVente')?.value || 0;
    if (purchasePrice === 0) return 0;
    return ((sellingPrice - purchasePrice) / purchasePrice) * 100;
  }

  generateReference(): void {
    // Simple reference generation - could be improved
    const categoryId = this.productForm.get('categorieId')?.value;
    const designation = this.productForm.get('designation')?.value || '';
    
    if (categoryId && designation) {
      const category = this.categories.find(c => c.id === categoryId);
      const categoryCode = category ? category.nom.substring(0, 3).toUpperCase() : 'PRD';
      const designationCode = designation.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      
      const reference = `${categoryCode}-${designationCode}-${timestamp}`;
      this.productForm.patchValue({ reference });
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.nom : 'Non sélectionnée';
  }

  getUnitLabel(unitValue: string): string {
    const unit = this.unitOptions.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue;
  }
}