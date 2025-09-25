import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { CreateSupplierRequest, SupplierResponse, UpdateSupplierRequest } from '../../../models/supplier.models';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit {
  isEdit = false;
  supplierId?: number;
  types: string[] = [];

  form = this.fb.group({
    raisonSociale: ['', Validators.required],
    typeFournisseur: ['', Validators.required],
    ice: ['', Validators.required],
    adresse: [''],
    ville: [''],
    codePostal: [''],
    pays: ['Tunisie'],
    telephone: [''],
    email: ['', [Validators.email]],
    conditionsPaiement: [''],
    delaiLivraisonMoyen: [0, [Validators.min(0)]],
    noteQualite: [0, [Validators.min(0), Validators.max(5)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    // Load types for select
    this.supplierService.getSupplierTypes().subscribe(res => {
      if (res.success && res.data) this.types = res.data;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.supplierId = +id;
      this.supplierService.getSupplierById(+id).subscribe(res => {
        if (res.success && res.data) this.form.patchValue(res.data as any);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const payload = this.form.value as CreateSupplierRequest;

    if (this.isEdit && this.supplierId) {
      const updatePayload: UpdateSupplierRequest = { id: this.supplierId, ...payload };
      this.supplierService.updateSupplier(this.supplierId, updatePayload).subscribe(res => {
        if (res.success) this.router.navigate(['/suppliers']);
      });
    } else {
      this.supplierService.createSupplier(payload).subscribe(res => {
        if (res.success) this.router.navigate(['/suppliers']);
      });
    }
  }
}


