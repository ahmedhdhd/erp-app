import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { CompanySettingsResponse, UpdateCompanySettingsRequest } from '../../models/sales.models';

@Component({
  selector: 'app-company-settings',
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.css']
})
export class CompanySettingsComponent implements OnInit {
  companySettingsForm: FormGroup;
  companySettings: CompanySettingsResponse | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService
  ) {
    this.companySettingsForm = this.fb.group({
      nomSociete: ['', [Validators.required, Validators.maxLength(200)]],
      adresse: ['', [Validators.maxLength(500)]],
      telephone: ['', [Validators.maxLength(50)]],
      email: ['', [Validators.maxLength(100)]],
      ice: ['', [Validators.maxLength(20)]],
      devise: ['TND', [Validators.maxLength(10)]],
      tauxTVA: [19, [Validators.min(0), Validators.max(100)]],
      logo: ['', [Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.loadCompanySettings();
  }

  loadCompanySettings(): void {
    this.loading = true;
    this.salesService.getCompanySettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.companySettings = response.data;
          this.companySettingsForm.patchValue(response.data);
        } else {
          // If no settings exist, we'll create them
          this.companySettings = null;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading company settings:', err);
        // If there's an error (likely 404), it means settings don't exist yet
        this.companySettings = null;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.companySettingsForm.invalid) {
      this.error = 'Veuillez remplir correctement tous les champs requis';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const formValue = this.companySettingsForm.value;
    const request: UpdateCompanySettingsRequest = {
      nomSociete: formValue.nomSociete,
      adresse: formValue.adresse,
      telephone: formValue.telephone,
      email: formValue.email,
      ice: formValue.ice,
      devise: formValue.devise,
      tauxTVA: formValue.tauxTVA,
      logo: formValue.logo
    };

    if (this.companySettings && this.companySettings.id) {
      // Update existing settings
      this.salesService.updateCompanySettings(request).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.companySettings = response.data;
            this.successMessage = 'Paramètres de l\'entreprise mis à jour avec succès';
          } else {
            this.error = response.message || 'Erreur lors de la mise à jour des paramètres';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour des paramètres';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      // Create new settings
      this.salesService.createCompanySettings(request).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.companySettings = response.data;
            this.successMessage = 'Paramètres de l\'entreprise créés avec succès';
          } else {
            this.error = response.message || 'Erreur lors de la création des paramètres';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors de la création des paramètres';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.companySettings) {
      this.companySettingsForm.patchValue(this.companySettings);
    }
  }
}