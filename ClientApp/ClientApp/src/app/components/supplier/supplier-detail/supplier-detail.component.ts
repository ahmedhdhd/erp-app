import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { SupplierResponse } from '../../../models/supplier.models';

@Component({
  selector: 'app-supplier-detail',
  templateUrl: './supplier-detail.component.html',
  styleUrls: ['./supplier-detail.component.css']
})
export class SupplierDetailComponent implements OnInit {
  supplier?: SupplierResponse;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.supplierService.getSupplierById(id).subscribe(res => {
        if (res.success && res.data) this.supplier = res.data;
      });
    }
  }

  editSupplier(): void {
    if (this.supplier) {
      this.router.navigate(['/suppliers', this.supplier.id, 'edit']);
    }
  }
}