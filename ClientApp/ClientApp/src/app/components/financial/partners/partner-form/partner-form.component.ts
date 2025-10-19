import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Partner, CreatePartnerDTO, UpdatePartnerDTO, PartnerType } from '../../../../models/financial.models';
import { FinancialService } from '../../../../services/financial.service';

@Component({
  selector: 'app-partner-form',
  templateUrl: './partner-form.component.html',
  styleUrls: ['./partner-form.component.css']
})
export class PartnerFormComponent implements OnInit {
  partnerForm: FormGroup;
  isEditMode = false;
  partnerId: number | null = null;
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Partner types for dropdown
  partnerTypes = [
    { value: PartnerType.Client, label: 'Client' },
    { value: PartnerType.Supplier, label: 'Fournisseur' },
    { value: PartnerType.Both, label: 'Les deux' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private financialService: FinancialService
  ) {
    this.partnerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', Validators.maxLength(20)],
      type: [PartnerType.Client, Validators.required],
      ice: ['', Validators.maxLength(20)],
      address: ['', Validators.maxLength(200)],
      city: ['', Validators.maxLength(50)],
      postalCode: ['', Validators.maxLength(10)],
      country: ['Tunisie', Validators.maxLength(50)],
      phone: ['', Validators.maxLength(20)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      taxNumber: ['', Validators.maxLength(50)],
      creditLimit: [0, [Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.partnerId = +params['id'];
        this.loadPartner();
      }
    });
  }

  loadPartner(): void {
    if (!this.partnerId) return;

    this.loading = true;
    this.errorMessage = null;

    this.financialService.getPartnerById(this.partnerId).subscribe({
      next: (partner: Partner) => {
        this.partnerForm.patchValue({
          name: partner.name,
          code: partner.code,
          type: partner.type,
          ice: partner.ice,
          address: partner.address,
          city: partner.city,
          postalCode: partner.postalCode,
          country: partner.country,
          phone: partner.phone,
          email: partner.email,
          taxNumber: partner.taxNumber,
          creditLimit: partner.creditLimit,
          isActive: partner.isActive
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading partner:', error);
        this.errorMessage = 'Erreur lors du chargement du partenaire';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.partnerForm.valid && !this.saving) {
      this.saving = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formValue = this.partnerForm.value;
      
      if (this.isEditMode && this.partnerId) {
        // Update existing partner
        const updateDTO: UpdatePartnerDTO = {
          name: formValue.name,
          code: formValue.code || undefined,
          type: formValue.type,
          ice: formValue.ice || undefined,
          address: formValue.address || undefined,
          city: formValue.city || undefined,
          postalCode: formValue.postalCode || undefined,
          country: formValue.country || undefined,
          phone: formValue.phone || undefined,
          email: formValue.email || undefined,
          taxNumber: formValue.taxNumber || undefined,
          creditLimit: formValue.creditLimit,
          isActive: formValue.isActive
        };

        this.financialService.updatePartner(this.partnerId, updateDTO).subscribe({
          next: () => {
            this.successMessage = 'Partenaire mis à jour avec succès';
            this.saving = false;
            setTimeout(() => {
              this.router.navigate(['/financial/partners']);
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error updating partner:', error);
            this.errorMessage = 'Erreur lors de la mise à jour du partenaire';
            this.saving = false;
          }
        });
      } else {
        // Create new partner
        const createDTO: CreatePartnerDTO = {
          name: formValue.name,
          code: formValue.code || undefined,
          type: formValue.type,
          ice: formValue.ice || undefined,
          address: formValue.address || undefined,
          city: formValue.city || undefined,
          postalCode: formValue.postalCode || undefined,
          country: formValue.country || 'Tunisie',
          phone: formValue.phone || undefined,
          email: formValue.email || undefined,
          taxNumber: formValue.taxNumber || undefined,
          creditLimit: formValue.creditLimit,
          isActive: true
        };

        this.financialService.createPartner(createDTO).subscribe({
          next: () => {
            this.successMessage = 'Partenaire créé avec succès';
            this.saving = false;
            this.partnerForm.reset({
              type: PartnerType.Client,
              country: 'Tunisie',
              creditLimit: 0,
              isActive: true
            });
            setTimeout(() => {
              this.router.navigate(['/financial/partners']);
            }, 2000);
          },
          error: (error: any) => {
            console.error('Error creating partner:', error);
            this.errorMessage = 'Erreur lors de la création du partenaire';
            this.saving = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.partnerForm.controls).forEach(key => {
        this.partnerForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial/partners']);
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadPartner();
    } else {
      this.partnerForm.reset({
        type: PartnerType.Client,
        country: 'Tunisie',
        creditLimit: 0,
        isActive: true
      });
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.partnerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.partnerForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${maxLength} caractères`;
      }
      if (field.errors['email']) {
        return 'Veuillez entrer une adresse email valide';
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} doit être positif ou nul`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nom',
      code: 'Code',
      type: 'Type',
      ice: 'ICE',
      address: 'Adresse',
      city: 'Ville',
      postalCode: 'Code postal',
      country: 'Pays',
      phone: 'Téléphone',
      email: 'Email',
      taxNumber: 'Numéro fiscal',
      creditLimit: 'Limite de crédit',
      isActive: 'Statut'
    };
    return labels[fieldName] || fieldName;
  }

  getPartnerTypeDisplay(type: number): string {
    const partnerTypeMap: { [key: number]: string } = {
      1: 'Client',
      2: 'Fournisseur',
      3: 'Les deux'
    };
    return partnerTypeMap[type] || 'Inconnu';
  }
}