import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ChangePasswordRequest, AuthResponse } from '../../../models/auth.models';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.changePasswordForm = this.formBuilder.group({
      motDePasseActuel: ['', [Validators.required]],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmerNouveauMotDePasse: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Component initialization
  }

  // Custom validator for password confirmation
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('nouveauMotDePasse');
    const confirmPassword = form.get('confirmerNouveauMotDePasse');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  get motDePasseActuel() { return this.changePasswordForm.get('motDePasseActuel'); }
  get nouveauMotDePasse() { return this.changePasswordForm.get('nouveauMotDePasse'); }
  get confirmerNouveauMotDePasse() { return this.changePasswordForm.get('confirmerNouveauMotDePasse'); }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const changePasswordRequest: ChangePasswordRequest = {
        motDePasseActuel: this.changePasswordForm.value.motDePasseActuel,
        nouveauMotDePasse: this.changePasswordForm.value.nouveauMotDePasse,
        confirmerNouveauMotDePasse: this.changePasswordForm.value.confirmerNouveauMotDePasse
      };

      this.authService.changePassword(changePasswordRequest).subscribe({
        next: (response: AuthResponse) => {
          if (response.success) {
            this.successMessage = 'Mot de passe changé avec succès!';
            this.changePasswordForm.reset();
            
            // Redirect to profile after a delay
            setTimeout(() => {
              this.router.navigate(['/profile']);
            }, 2000);
          } else {
            this.errorMessage = response.message;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Une erreur est survenue lors du changement de mot de passe';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.changePasswordForm.controls).forEach(key => {
      const control = this.changePasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.changePasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const errors = field.errors;
      
      if (errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} est requis`;
      }
      if (errors['minlength']) {
        const requiredLength = errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} doit contenir au moins ${requiredLength} caractères`;
      }
      if (errors['maxlength']) {
        const maxLength = errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} ne peut pas dépasser ${maxLength} caractères`;
      }
      if (errors['passwordMismatch']) {
        return 'Les nouveaux mots de passe ne correspondent pas';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'motDePasseActuel': 'Le mot de passe actuel',
      'nouveauMotDePasse': 'Le nouveau mot de passe',
      'confirmerNouveauMotDePasse': 'La confirmation du nouveau mot de passe'
    };
    return displayNames[fieldName] || fieldName;
  }

  getPasswordStrength(password: string): { strength: string, class: string, percentage: number } {
    if (!password) {
      return { strength: '', class: '', percentage: 0 };
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const strengthMap = [
      { strength: 'Très faible', class: 'danger', percentage: 20 },
      { strength: 'Faible', class: 'warning', percentage: 40 },
      { strength: 'Moyenne', class: 'info', percentage: 60 },
      { strength: 'Bonne', class: 'primary', percentage: 80 },
      { strength: 'Forte', class: 'success', percentage: 100 },
      { strength: 'Très forte', class: 'success', percentage: 100 }
    ];

    return strengthMap[Math.min(score, 5)];
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }
}