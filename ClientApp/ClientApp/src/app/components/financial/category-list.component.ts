import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinancialService } from '../../services/financial.service';
import { TransactionCategory } from '../../models/financial.models';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: TransactionCategory[] = [];
  loading: boolean = false;

  constructor(
    private financialService: FinancialService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.financialService.getAllCategories().subscribe(response => {
      if (response.success) {
        this.categories = response.data || [];
      }
      this.loading = false;
    });
  }

  onEdit(category: TransactionCategory): void {
    this.router.navigate(['/financial/categories/edit', category.id]);
  }

  onDelete(category: TransactionCategory): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.nom}" ?`)) {
      this.financialService.deleteCategory(category.id).subscribe(response => {
        if (response.success) {
          this.loadCategories();
        } else {
          alert('Erreur lors de la suppression de la catégorie');
        }
      });
    }
  }

  onView(category: TransactionCategory): void {
    this.router.navigate(['/financial/categories/view', category.id]);
  }

  onAddNew(): void {
    this.router.navigate(['/financial/categories/new']);
  }
}