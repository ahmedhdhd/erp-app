import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ProductResponse, StockMovementResponse, ProductApiResponse } from '../../../models/product.models';

interface StockMovementDisplay {
  date: Date;
  utilisateur: string;
  operation: string;
  qteEntre: number;
  qteSortie: number;
  stock: number;
}

@Component({
  selector: 'app-stock-movement',
  templateUrl: './stock-movement.component.html',
  styleUrls: ['./stock-movement.component.css']
})
export class StockMovementComponent implements OnInit {
  movementForm: FormGroup;
  products: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  selectedProduct: ProductResponse | null = null;
  movements: StockMovementDisplay[] = [];
  
  loading = false;
  error: string | null = null;
  searchTerm = '';
  
  // Date range for filtering
  startDate: string;
  endDate: string;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    // Initialize dates to first and last day of current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];
    
    this.movementForm = this.fb.group({
      startDate: [this.startDate],
      endDate: [this.endDate]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(1, 1000).subscribe({
      next: (response: ProductApiResponse<{ products: ProductResponse[], totalCount: number }>) => {
        if (response.success && response.data) {
          this.products = response.data.products;
          this.filteredProducts = [...this.products];
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.designation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.reference.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onProductSelect(product: ProductResponse): void {
    this.selectedProduct = product;
    this.loadStockMovements(product.id);
  }

  onStartDateChange(event: any): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.movementForm.get('startDate')?.setValue(target.value);
      this.onDateChange();
    }
  }

  onEndDateChange(event: any): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.movementForm.get('endDate')?.setValue(target.value);
      this.onDateChange();
    }
  }

  loadStockMovements(productId: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getStockMovements(productId).subscribe({
      next: (response: ProductApiResponse<StockMovementResponse[]>) => {
        if (response.success && response.data) {
          // Transform stock movements to display format
          this.movements = this.transformMovements(response.data);
        } else {
          this.movements = [];
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading stock movements:', error);
        this.error = 'Failed to load stock movements';
        this.movements = [];
        this.loading = false;
      }
    });
  }

  transformMovements(movements: StockMovementResponse[]): StockMovementDisplay[] {
    // Filter movements by date range
    const startDate = this.movementForm.get('startDate')?.value;
    const endDate = this.movementForm.get('endDate')?.value;
    
    let filteredMovements = movements;
    if (startDate && endDate) {
      filteredMovements = movements.filter(movement => {
        const movementDate = new Date(movement.dateMouvement);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set to end of day
        return movementDate >= start && movementDate <= end;
      });
    }
    
    // Transform to display format
    return filteredMovements.map(movement => {
      let operation = '';
      let qteEntre = 0;
      let qteSortie = 0;
      
      // Determine operation type and quantities
      if (movement.type.toLowerCase().includes('achat') || movement.type === 'ENTREE' || movement.type.toLowerCase().includes('purchase')) {
        operation = `Facture Achat n° : ${movement.referenceDocument}`;
        qteEntre = movement.quantite;
        qteSortie = 0;
      } else if (movement.type.toLowerCase().includes('vente') || movement.type === 'SORTIE' || movement.type.toLowerCase().includes('sale')) {
        operation = `Facture Vente n° : ${movement.referenceDocument}`;
        qteEntre = 0;
        qteSortie = movement.quantite;
      } else {
        operation = movement.referenceDocument || movement.type;
        // For other types, we'll need to determine based on quantity sign
        if (movement.quantite >= 0) {
          qteEntre = movement.quantite;
          qteSortie = 0;
        } else {
          qteEntre = 0;
          qteSortie = Math.abs(movement.quantite);
        }
      }
      
      return {
        date: new Date(movement.dateMouvement),
        utilisateur: movement.creePar,
        operation: operation,
        qteEntre: qteEntre,
        qteSortie: qteSortie,
        stock: this.calculateStockLevel(movement) // This would need to be calculated properly
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }

  calculateStockLevel(movement: StockMovementResponse): number {
    // This is a simplified calculation - in a real app, you would calculate the actual stock level
    // based on all previous movements
    return movement.quantite >= 0 ? movement.quantite : Math.abs(movement.quantite);
  }

  onDateChange(): void {
    if (this.selectedProduct) {
      this.loadStockMovements(this.selectedProduct.id);
    }
  }

  clearSelection(): void {
    this.selectedProduct = null;
    this.movements = [];
    this.searchTerm = '';
    this.filteredProducts = [...this.products];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}