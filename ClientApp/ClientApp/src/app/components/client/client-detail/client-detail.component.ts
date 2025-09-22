import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { 
  ClientResponse, 
  ContactClientResponse,
  CreateContactClientRequest,
  ClientApiResponse
} from '../../../models/client.models';
import { ClientService } from '../../../services/client.service';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  client: ClientResponse | null = null;
  loading = false;
  errorMessage = '';
  
  // Contact form
  contactForm!: FormGroup;
  showContactForm = false;
  isEditingContact = false;
  editingContactId: number | null = null;
  
  // Form validation
  submitted = false;
  contactErrors: string[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeContactForm();
  }

  ngOnInit(): void {
    this.loadClient();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeContactForm(): void {
    this.contactForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      poste: ['', [Validators.maxLength(100)]],
      telephone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      role: ['Commercial', [Validators.required]]
    });
  }

  private loadClient(): void {
    const clientId = Number(this.route.snapshot.paramMap.get('id'));
    if (!clientId) {
      this.errorMessage = 'ID de client invalide';
      return;
    }

    this.loading = true;
    this.clientService.getClientById(clientId).subscribe({
      next: (response: ClientApiResponse<ClientResponse>) => {
        this.loading = false;
        if (response.success && response.data) {
          this.client = response.data;
        } else {
          this.errorMessage = response.message || 'Client non trouvé';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error.message || 'Erreur lors du chargement du client';
        console.error('Error loading client:', error);
      }
    });
  }

  // ==================== ACTIONS ====================

  editClient(): void {
    if (this.client) {
      this.router.navigate(['/clients', this.client.id, 'edit']);
    }
  }

  deleteClient(): void {
    if (this.client && confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(this.client.id).subscribe({
        next: (response: ClientApiResponse<any>) => {
          if (response.success) {
            this.router.navigate(['/clients']);
            alert('Client supprimé avec succès');
          } else {
            alert(response.message || 'Erreur lors de la suppression du client');
          }
        },
        error: (error: any) => {
          console.error('Error deleting client:', error);
          alert('Erreur lors de la suppression du client');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }

  // ==================== CONTACT OPERATIONS ====================

  showAddContactForm(): void {
    this.showContactForm = true;
    this.isEditingContact = false;
    this.editingContactId = null;
    this.contactForm.reset({
      nom: '',
      poste: '',
      telephone: '',
      email: '',
      role: 'Commercial'
    });
    this.contactErrors = [];
  }

  showEditContactForm(contact: ContactClientResponse): void {
    this.showContactForm = true;
    this.isEditingContact = true;
    this.editingContactId = contact.id;
    this.contactForm.patchValue({
      nom: contact.nom,
      poste: contact.poste,
      telephone: contact.telephone,
      email: contact.email,
      role: contact.role
    });
    this.contactErrors = [];
  }

  cancelContactForm(): void {
    this.showContactForm = false;
    this.contactForm.reset();
    this.contactErrors = [];
  }

  saveContact(): void {
    if (!this.client) return;
    
    this.submitted = true;
    this.contactErrors = [];

    if (this.contactForm.invalid) {
      this.markFormGroupTouched(this.contactForm);
      this.contactErrors.push('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const formData = this.contactForm.value;
    
    if (this.isEditingContact && this.editingContactId) {
      // Update existing contact
      const request = {
        id: this.editingContactId,
        nom: formData.nom,
        poste: formData.poste,
        telephone: formData.telephone,
        email: formData.email,
        role: formData.role
      };
      
      this.clientService.updateContact(request).subscribe({
        next: (response: ClientApiResponse<ContactClientResponse>) => {
          if (response.success) {
            this.loadClient(); // Reload client to get updated contacts
            this.cancelContactForm();
            alert('Contact mis à jour avec succès');
          } else {
            this.contactErrors.push(response.message || 'Erreur lors de la mise à jour du contact');
          }
        },
        error: (error: any) => {
          console.error('Error updating contact:', error);
          this.contactErrors.push('Erreur lors de la mise à jour du contact');
        }
      });
    } else {
      // Create new contact
      const request: CreateContactClientRequest = {
        nom: formData.nom,
        poste: formData.poste,
        telephone: formData.telephone,
        email: formData.email,
        role: formData.role
      };
      
      this.clientService.createContact(this.client!.id, request).subscribe({
        next: (response: ClientApiResponse<ContactClientResponse>) => {
          if (response.success) {
            this.loadClient(); // Reload client to get updated contacts
            this.cancelContactForm();
            alert('Contact créé avec succès');
          } else {
            this.contactErrors.push(response.message || 'Erreur lors de la création du contact');
          }
        },
        error: (error: any) => {
          console.error('Error creating contact:', error);
          this.contactErrors.push('Erreur lors de la création du contact');
        }
      });
    }
  }

  deleteContact(contactId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      this.clientService.deleteContact(contactId).subscribe({
        next: (response: ClientApiResponse<any>) => {
          if (response.success) {
            this.loadClient(); // Reload client to get updated contacts
            alert('Contact supprimé avec succès');
          } else {
            alert(response.message || 'Erreur lors de la suppression du contact');
          }
        },
        error: (error: any) => {
          console.error('Error deleting contact:', error);
          alert('Erreur lors de la suppression du contact');
        }
      });
    }
  }

  // ==================== UTILITY METHODS ====================

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return permission.split(',').some(role => this.authService.hasRole(role.trim()));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched || this.submitted)) {
      const errors = field.errors;
      
      if (errors['required']) return `${this.getFieldLabel(fieldName)} est obligatoire`;
      if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
      if (errors['email']) return `${this.getFieldLabel(fieldName)} doit être une adresse email valide`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nom': 'Le nom',
      'poste': 'Le poste',
      'telephone': 'Le téléphone',
      'email': 'L\'email',
      'role': 'Le rôle'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}