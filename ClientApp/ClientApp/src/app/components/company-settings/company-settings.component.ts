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
  logoPreview: string | any = null;
  cachedLogoUrl: string | null = null; // Cache for the logo URL

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
      rc: ['', [Validators.maxLength(50)]], // New field
      mf: ['', [Validators.maxLength(50)]], // New field
      rib: ['', [Validators.maxLength(50)]], // New field
      devise: ['TND', [Validators.maxLength(10)]],
      tauxTVA: [19, [Validators.min(0), Validators.max(100)]],
      logo: ['', []] // No max length limit for URL
    });
    
    // Load cached logo URL from localStorage if available
    this.loadCachedLogoUrl();
  }

  ngOnInit(): void {
    this.loadCompanySettings();
  }

  // Load cached logo URL from localStorage
  private loadCachedLogoUrl(): void {
    try {
      const cached = localStorage.getItem('companyLogoUrl');
      if (cached) {
        this.cachedLogoUrl = cached;
      }
    } catch (e) {
      console.warn('Could not load cached logo URL from localStorage', e);
    }
  }

  // Save logo URL to cache
  private cacheLogoUrl(url: string): void {
    try {
      if (url) {
        localStorage.setItem('companyLogoUrl', url);
        this.cachedLogoUrl = url;
      }
    } catch (e) {
      console.warn('Could not cache logo URL to localStorage', e);
    }
  }

  // Clear cached logo URL
  private clearCachedLogoUrl(): void {
    try {
      localStorage.removeItem('companyLogoUrl');
      this.cachedLogoUrl = null;
    } catch (e) {
      console.warn('Could not clear cached logo URL from localStorage', e);
    }
  }

  loadCompanySettings(): void {
    this.loading = true;
    this.salesService.getCompanySettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.companySettings = response.data;
          this.companySettingsForm.patchValue(response.data);
          // Set logo preview if logo URL exists
          if (response.data.logo) {
            this.logoPreview = response.data.logo;
            // Cache the logo URL
            this.cacheLogoUrl(response.data.logo);
          } else if (this.cachedLogoUrl) {
            // Use cached logo URL if available and no logo is set in the response
            this.logoPreview = this.cachedLogoUrl;
            this.companySettingsForm.patchValue({ logo: this.cachedLogoUrl });
          }
        } else {
          // If no settings exist, we'll create them
          this.companySettings = null;
          // Use cached logo URL if available
          if (this.cachedLogoUrl) {
            this.logoPreview = this.cachedLogoUrl;
            this.companySettingsForm.patchValue({ logo: this.cachedLogoUrl });
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading company settings:', err);
        // If there's an error (likely 404), it means settings don't exist yet
        this.companySettings = null;
        // Use cached logo URL if available
        if (this.cachedLogoUrl) {
          this.logoPreview = this.cachedLogoUrl;
          this.companySettingsForm.patchValue({ logo: this.cachedLogoUrl });
        }
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        this.error = 'Veuillez sélectionner un fichier image valide (JPG, PNG, GIF)';
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error = 'La taille du fichier ne doit pas dépasser 2MB';
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        // For now, we'll just show the preview
        // In a real implementation, you would upload the file to a server
        // and get back a URL to store in the logo field
        this.companySettingsForm.patchValue({ logo: this.logoPreview });
        // Cache the logo URL
        this.cacheLogoUrl(this.logoPreview);
      };
      reader.readAsDataURL(file);
      
      // Clear error message
      this.error = null;
    }
  }

  onLogoUrlChange(event: any): void {
    const url = event.target.value;
    if (url) {
      this.logoPreview = url;
      // Cache the logo URL
      this.cacheLogoUrl(url);
    } else {
      this.logoPreview = null;
      // Clear cached logo URL
      this.clearCachedLogoUrl();
    }
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
      rc: formValue.rc, // New field
      mf: formValue.mf, // New field
      rib: formValue.rib, // New field
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
            // Cache the logo URL
            if (response.data.logo) {
              this.cacheLogoUrl(response.data.logo);
            }
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
            // Cache the logo URL
            if (response.data.logo) {
              this.cacheLogoUrl(response.data.logo);
            }
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
      // Reset logo preview
      this.logoPreview = this.companySettings.logo || this.cachedLogoUrl || null;
      // Restore cached logo URL if needed
      if (!this.companySettings.logo && this.cachedLogoUrl) {
        this.companySettingsForm.patchValue({ logo: this.cachedLogoUrl });
      }
    } else if (this.cachedLogoUrl) {
      // Use cached logo URL if no company settings exist
      this.logoPreview = this.cachedLogoUrl;
      this.companySettingsForm.patchValue({ logo: this.cachedLogoUrl });
    }
  }
}