import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientApiResponse
} from '../../../models/client.models';
import { ClientService } from '../../../services/client.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit, OnDestroy {
  clientForm!: FormGroup;
  isEditing = false;
  clientId?: number;
  loading = false;
  saving = false;
  
  // Form validation
  submitted = false;
  errors: { [key: string]: string[] } = {};
  
  // Available options (loaded from API)
  clientTypes: string[] = ['Individuel', 'Entreprise', 'Grossiste', 'Détailant'];
  classifications: string[] = ['VIP', 'Standard', 'Nouveau'];
  cities: string[] = [];
  countries: string[] = ['Tunisie'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCities();
    this.checkRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeForm(): void {
    this.clientForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      prenom: ['', [Validators.maxLength(100)]],
      raisonSociale: ['', [Validators.maxLength(200)]],
      typeClient: ['Individuel', [Validators.required]],
      ice: ['', [Validators.maxLength(50)]],
      adresse: ['', [Validators.maxLength(500)]],
      ville: ['', [Validators.maxLength(100)]],
      codePostal: ['', [Validators.maxLength(10)]],
      pays: ['Tunisie', [Validators.required]],
      telephone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      classification: ['Standard', [Validators.required]],
      limiteCredit: [0, [Validators.min(0)]],
      estActif: [true, [Validators.required]]
    });

    // Add form value change listeners
    this.setupFormValidation();
  }

  private setupFormValidation(): void {
    // Ensure credit limit is not negative
    this.clientForm.get('limiteCredit')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(creditLimit => {
      if (creditLimit < 0) {
        this.clientForm.get('limiteCredit')?.setValue(0, { emitEvent: false });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/clients']);
  }

  private checkRouteParams(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.clientId = +params['id'];
        this.isEditing = true;
        this.loadClient();
      }
    });
  }

  // ==================== DATA LOADING ====================

  private loadCities(): void {
    this.clientService.getCities().subscribe({
      next: (response: ClientApiResponse<string[]>) => {
        if (response.success && response.data) {
          this.cities = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading cities:', error);
        // Fallback to common Tunisian cities
        this.cities = [
          'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 
          'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Béja',
          'Kasserine', 'Médenine', 'Tataouine', 'Tozeur', 'Kébili',
          'Siliana', 'Mahdia', 'Sidi Bouzid', 'Jendouba', 'Ben Arous',
          'Manouba', 'Nabeul', 'Zaghouan'
        ];
      }
    });
  }

  private loadClient(): void {
    if (!this.clientId) return;

    this.loading = true;
    this.clientService.getClientById(this.clientId).subscribe({
      next: (response: ClientApiResponse<ClientResponse>) => {
        if (response.success && response.data) {
          this.populateForm(response.data);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading client:', error);
        this.addError('Erreur lors du chargement du client');
        this.loading = false;
      }
    });
  }

  private populateForm(client: ClientResponse): void {
    this.clientForm.patchValue({
      nom: client.nom,
      prenom: client.prenom,
      raisonSociale: client.raisonSociale,
      typeClient: client.typeClient,
      ice: client.ice,
      adresse: client.adresse,
      ville: client.ville,
      codePostal: client.codePostal,
      pays: client.pays,
      telephone: client.telephone,
      email: client.email,
      classification: client.classification,
      limiteCredit: client.limiteCredit,
      estActif: client.estActif
    });
  }

  // ==================== FORM SUBMISSION ====================

  onSubmit(): void {
    this.submitted = true;
    this.errors = {};

    if (this.clientForm.invalid) {
      this.markFormGroupTouched(this.clientForm);
      this.addError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (this.isEditing) {
      this.updateClient();
    } else {
      this.createClient();
    }
  }

  private createClient(): void {
    const formData = this.clientForm.value;
    const request: CreateClientRequest = {
      nom: formData.nom,
      prenom: formData.prenom,
      raisonSociale: formData.raisonSociale,
      typeClient: formData.typeClient,
      ice: formData.ice,
      adresse: formData.adresse,
      ville: formData.ville,
      codePostal: formData.codePostal,
      pays: formData.pays,
      telephone: formData.telephone,
      email: formData.email,
      classification: formData.classification,
      limiteCredit: formData.limiteCredit,
      estActif: formData.estActif
    };

    this.saving = true;
    this.clientService.createClient(request).subscribe({
      next: (response: ClientApiResponse<ClientResponse>) => {
        if (response.success) {
          this.addSuccess('Client créé avec succès');
          this.router.navigate(['/clients']);
        } else {
          this.addError(response.message || 'Erreur lors de la création du client');
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Error creating client:', error);
        this.addError('Erreur lors de la création du client');
        this.saving = false;
      }
    });
  }

  private updateClient(): void {
    if (!this.clientId) return;

    const formData = this.clientForm.value;
    const request: UpdateClientRequest = {
      id: this.clientId,
      nom: formData.nom,
      prenom: formData.prenom,
      raisonSociale: formData.raisonSociale,
      typeClient: formData.typeClient,
      ice: formData.ice,
      adresse: formData.adresse,
      ville: formData.ville,
      codePostal: formData.codePostal,
      pays: formData.pays,
      telephone: formData.telephone,
      email: formData.email,
      classification: formData.classification,
      limiteCredit: formData.limiteCredit,
      estActif: formData.estActif
    };

    this.saving = true;
    this.clientService.updateClient(this.clientId, request).subscribe({
      next: (response: ClientApiResponse<ClientResponse>) => {
        if (response.success) {
          this.addSuccess('Client modifié avec succès');
          this.router.navigate(['/clients']);
        } else {
          this.addError(response.message || 'Erreur lors de la modification du client');
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Error updating client:', error);
        this.addError('Erreur lors de la modification du client');
        this.saving = false;
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return permission.split(',').some(role => this.authService.hasRole(role.trim()));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched || this.submitted)) {
      const errors = field.errors;
      
      if (errors['required']) return `${this.getFieldLabel(fieldName)} est obligatoire`;
      if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
      if (errors['email']) return `${this.getFieldLabel(fieldName)} doit être une adresse email valide`;
      if (errors['min']) return `${this.getFieldLabel(fieldName)} doit être supérieur ou égal à ${errors['min'].min}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nom': 'Le nom',
      'prenom': 'Le prénom',
      'raisonSociale': 'La raison sociale',
      'typeClient': 'Le type de client',
      'ice': 'L\'ICE',
      'adresse': 'L\'adresse',
      'ville': 'La ville',
      'codePostal': 'Le code postal',
      'pays': 'Le pays',
      'telephone': 'Le téléphone',
      'email': 'L\'email',
      'classification': 'La classification',
      'limiteCredit': 'La limite de crédit'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  private handleApiErrors(errors: string[]): void {
    if (errors && errors.length > 0) {
      errors.forEach(error => this.addError(error));
    } else {
      this.addError('Une erreur est survenue lors de l\'opération');
    }
  }

  private addError(message: string): void {
    if (!this.errors['general']) this.errors['general'] = [];
    this.errors['general'].push(message);
  }

  private addSuccess(message: string): void {
    // Could implement a toast service here
    alert(message);
  }

  getCityName(cityCode: string): string {
    // In a real implementation, you might have a mapping of codes to names
    return cityCode;
  }
}