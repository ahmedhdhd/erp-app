import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SupplierService } from '../../../services/supplier.service';
import { SupplierListResponse, SupplierResponse, SupplierSearchRequest } from '../../../models/supplier.models';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: SupplierResponse[] = [];
  loading = false;

  // Filters & search
  searchForm!: FormGroup;
  showAdvancedSearch = false;
  types: string[] = [];
  cities: string[] = [];
  paymentTerms: string[] = [];

  // Pagination
  totalCount = 0;
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  constructor(private supplierService: SupplierService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.supplierService.loading$.subscribe(v => (this.loading = v));
    this.supplierService.suppliers$.subscribe(list => (this.suppliers = list || []));

    this.searchForm = this.fb.group({
      searchTerm: [''],
      typeFournisseur: [''],
      ville: [''],
      conditionsPaiement: [''],
      delaiLivraisonMin: [null],
      delaiLivraisonMax: [null],
      noteQualiteMin: [null],
      noteQualiteMax: [null],
      sortBy: ['raisonSociale'],
      sortDirection: ['asc']
    });

    // Load filter lists
    this.supplierService.getSupplierTypes().subscribe(r => { if (r.success && r.data) this.types = r.data; });
    this.supplierService.getCities().subscribe(r => { if (r.success && r.data) this.cities = r.data; });
    this.supplierService.getPaymentTerms().subscribe(r => { if (r.success && r.data) this.paymentTerms = r.data; });

    this.loadSuppliers();
  }

  private loadSuppliers(): void {
    this.supplierService.getSuppliers(this.currentPage, this.pageSize).subscribe(res => {
      if (res.success && res.data) {
        this.updatePaging(res.data);
      }
    });
  }

  private updatePaging(data: SupplierListResponse): void {
    this.totalCount = data.totalCount;
    this.totalPages = data.totalPages;
    this.currentPage = data.page;
    this.pageSize = data.pageSize;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch(): void {
    const payload: SupplierSearchRequest = {
      ...this.searchForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };
    this.supplierService.searchSuppliers(payload).subscribe(res => {
      if (res.success && res.data) {
        this.updatePaging(res.data);
      }
    });
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchTerm: '',
      typeFournisseur: '',
      ville: '',
      conditionsPaiement: '',
      delaiLivraisonMin: null,
      delaiLivraisonMax: null,
      noteQualiteMin: null,
      noteQualiteMax: null,
      sortBy: 'raisonSociale',
      sortDirection: 'asc'
    });
    this.currentPage = 1;
    this.loadSuppliers();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.onSearch();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.onSearch();
  }

  sortBy(field: string): void {
    const current = this.searchForm.get('sortBy')?.value;
    const dir = this.searchForm.get('sortDirection')?.value;
    if (current === field) {
      this.searchForm.patchValue({ sortDirection: dir === 'asc' ? 'desc' : 'asc' });
    } else {
      this.searchForm.patchValue({ sortBy: field, sortDirection: 'asc' });
    }
    this.onSearch();
  }

  deleteSupplier(s: SupplierResponse): void {
    if (!confirm(`Supprimer le fournisseur "${s.raisonSociale}" ?`)) return;
    this.supplierService.deleteSupplier(s.id).subscribe(res => {
      if (res.success) {
        this.onSearch();
      }
    });
  }
}


