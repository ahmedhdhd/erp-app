import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ProductApiResponse
} from '../../models/product.models';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
  categories: CategoryResponse[] = [];
  loading = false;
  saving = false;
  
  // Form management
  categoryForm!: FormGroup;
  isEditing = false;
  editingCategoryId?: number;
  showForm = false;
  
  // Search and filter
  searchTerm = '';
  filteredCategories: CategoryResponse[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.subscribeToCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeForm(): void {
    this.categoryForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      categorieParentId: [null],
      estActif: [true]
    });
  }

  private loadCategories(): void {
    this.loading = true;
    this.productService.getCategories().subscribe({
      next: (response: ProductApiResponse<CategoryResponse[]>) => {
        if (response.success && response.data) {
          this.categories = response.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  private subscribeToCategories(): void {
    this.productService.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories: CategoryResponse[]) => {
        this.categories = categories;
        this.applyFilters();
      });
  }

  // ==================== SEARCH AND FILTERING ====================

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  private applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(category =>
        category.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  // ==================== FORM MANAGEMENT ====================

  showCreateForm(): void {
    this.isEditing = false;
    this.editingCategoryId = undefined;
    this.showForm = true;
    this.categoryForm.reset({
      nom: '',
      description: '',
      categorieParentId: null,
      estActif: true
    });
  }

  editCategory(category: CategoryResponse): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.showForm = true;
    this.categoryForm.patchValue({
      nom: category.nom,
      description: category.description,
      categorieParentId: category.categorieParentId,
      estActif: category.estActif
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingCategoryId = undefined;
    this.categoryForm.reset();
  }

  // ==================== CRUD OPERATIONS ====================

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      return;
    }

    if (this.isEditing) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  private createCategory(): void {
    const formValue = this.categoryForm.value;
    const request: CreateCategoryRequest = {
      nom: formValue.nom,
      description: formValue.description,
      categorieParentId: formValue.categorieParentId,
      estActif: formValue.estActif
    };

    this.saving = true;
    this.productService.createCategory(request).subscribe({
      next: (response: ProductApiResponse<CategoryResponse>) => {
        if (response.success) {
          this.showSuccessMessage('Catégorie créée avec succès');
          this.cancelForm();
          this.loadCategories();
        } else {
          this.showErrorMessage(response.message || 'Erreur lors de la création');
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Error creating category:', error);
        this.showErrorMessage('Erreur lors de la création de la catégorie');
        this.saving = false;
      }
    });
  }

  private updateCategory(): void {
    if (!this.editingCategoryId) return;

    const formValue = this.categoryForm.value;
    const request: UpdateCategoryRequest = {
      id: this.editingCategoryId,
      nom: formValue.nom,
      description: formValue.description,
      categorieParentId: formValue.categorieParentId,
      estActif: formValue.estActif
    };

    this.saving = true;
    this.productService.updateCategory(this.editingCategoryId, request).subscribe({
      next: (response: ProductApiResponse<CategoryResponse>) => {
        if (response.success) {
          this.showSuccessMessage('Catégorie modifiée avec succès');
          this.cancelForm();
          this.loadCategories();
        } else {
          this.showErrorMessage(response.message || 'Erreur lors de la modification');
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Error updating category:', error);
        this.showErrorMessage('Erreur lors de la modification de la catégorie');
        this.saving = false;
      }
    });
  }

  deleteCategory(category: CategoryResponse): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.nom}" ?`)) {
      return;
    }

    this.productService.deleteCategory(category.id).subscribe({
      next: (response: ProductApiResponse<any>) => {
        if (response.success) {
          this.showSuccessMessage('Catégorie supprimée avec succès');
          this.loadCategories();
        } else {
          this.showErrorMessage(response.message || 'Erreur lors de la suppression');
        }
      },
      error: (error: any) => {
        console.error('Error deleting category:', error);
        this.showErrorMessage('Erreur lors de la suppression de la catégorie');
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return permission.split(',').some(role => this.authService.hasRole(role.trim()));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      const errors = field.errors;
      
      if (errors['required']) return `${this.getFieldLabel(fieldName)} est obligatoire`;
      if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nom': 'Le nom',
      'description': 'La description'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getParentCategories(): CategoryResponse[] {
    return this.categories.filter(cat => cat.categorieParentId === null);
  }

  getParentCategoryName(parentId: number | null): string {
    if (!parentId) return 'Aucune';
    const parent = this.categories.find(c => c.id === parentId);
    return parent ? parent.nom : 'Inconnu';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  private showSuccessMessage(message: string): void {
    // Could implement a toast service here
    alert(message);
  }

  private showErrorMessage(message: string): void {
    // Could implement a toast service here
    alert(message);
  }

  refresh(): void {
    this.loadCategories();
  }

  getActiveCategoriesCount(): number {
    return this.filteredCategories.filter(cat => cat.estActif).length;
  }

  getTotalProductsCount(): number {
    return this.filteredCategories.reduce((sum, cat) => sum + cat.nombreProduits, 0);
  }

  getTotalSubCategoriesCount(): number {
    return this.filteredCategories.reduce((sum, cat) => sum + cat.nombreSousCategories, 0);
  }
}