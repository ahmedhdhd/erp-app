import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancialService } from '../../services/financial.service';
import { TransactionCategory, CreateCategoryRequest, UpdateCategoryRequest } from '../../models/financial.models';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode: boolean = false;
  categoryId: number | null = null;
  categories: TransactionCategory[] = [];
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private financialService: FinancialService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.categoryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.categoryId = +params['id'];
        this.loadCategory(this.categoryId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      parentCategoryId: [null]
    });
  }

  loadCategories(): void {
    this.financialService.getAllCategories().subscribe(response => {
      if (response.success) {
        this.categories = response.data || [];
      }
    });
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.financialService.getCategoryById(id).subscribe(response => {
      if (response.success && response.data) {
        const category = response.data;
        this.categoryForm.patchValue({
          nom: category.nom,
          description: category.description,
          type: category.type,
          parentCategoryId: category.parentCategoryId
        });
      }
      this.loading = false;
    });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.categoryForm.invalid) {
      return;
    }

    this.loading = true;
    
    if (this.isEditMode && this.categoryId) {
      const request: UpdateCategoryRequest = {
        id: this.categoryId,
        ...this.categoryForm.value
      };
      
      this.financialService.updateCategory(this.categoryId, request).subscribe(response => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/financial/categories']);
        } else {
          alert('Erreur lors de la mise à jour de la catégorie');
        }
      });
    } else {
      const request: CreateCategoryRequest = this.categoryForm.value;
      
      this.financialService.createCategory(request).subscribe(response => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/financial/categories']);
        } else {
          alert('Erreur lors de la création de la catégorie');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/categories']);
  }

  // Getters for easy access to form controls
  get f() { return this.categoryForm.controls; }
}