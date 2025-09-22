import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest, AuthResponse } from '../../../models/auth.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      nomUtilisateur: ['', [Validators.required, Validators.minLength(3)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get nomUtilisateur() { return this.loginForm.get('nomUtilisateur'); }
  get motDePasse() { return this.loginForm.get('motDePasse'); }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = {
        nomUtilisateur: this.loginForm.value.nomUtilisateur,
        motDePasse: this.loginForm.value.motDePasse
      };

      this.authService.login(loginRequest).subscribe({
        next: (response: AuthResponse) => {
          if (response.success) {
            // Login successful, redirect to return URL
            this.router.navigate([this.returnUrl]);
          } else {
            this.errorMessage = response.message;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Une erreur est survenue lors de la connexion';
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template validation checks
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} est requis`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} doit contenir au moins ${requiredLength} caractères`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'nomUtilisateur': 'Le nom d\'utilisateur',
      'motDePasse': 'Le mot de passe'
    };
    return displayNames[fieldName] || fieldName;
  }
}