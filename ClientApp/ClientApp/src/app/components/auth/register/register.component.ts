import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest, AuthResponse, Employee, UserRole } from '../../../models/auth.models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  availableEmployees: Employee[] = [];
  availableRoles = [
    { value: UserRole.ADMIN, label: 'Administrateur' },
    { value: UserRole.VENDEUR, label: 'Vendeur' },
    { value: UserRole.ACHETEUR, label: 'Acheteur' },
    { value: UserRole.COMPTABLE, label: 'Comptable' },
    { value: UserRole.RH, label: 'Ressources Humaines' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      nomUtilisateur: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmerMotDePasse: ['', [Validators.required]],
      role: ['', [Validators.required]],
      employeId: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadAvailableEmployees();
  }

  // Custom validator for password confirmation
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('motDePasse');
    const confirmPassword = form.get('confirmerMotDePasse');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  get nomUtilisateur() { return this.registerForm.get('nomUtilisateur'); }
  get motDePasse() { return this.registerForm.get('motDePasse'); }
  get confirmerMotDePasse() { return this.registerForm.get('confirmerMotDePasse'); }
  get role() { return this.registerForm.get('role'); }
  get employeId() { return this.registerForm.get('employeId'); }

  loadAvailableEmployees(): void {
    this.authService.getAvailableEmployees().subscribe({
      next: (employees: Employee[]) => {
        console.log('Available employees loaded:', employees);
        this.availableEmployees = employees;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des employés disponibles';
        console.error('Error loading employees:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registerRequest: RegisterRequest = {
        nomUtilisateur: this.registerForm.value.nomUtilisateur,
        motDePasse: this.registerForm.value.motDePasse,
        confirmerMotDePasse: this.registerForm.value.confirmerMotDePasse,
        role: this.registerForm.value.role,
        employeId: parseInt(this.registerForm.value.employeId)
      };

      this.authService.register(registerRequest).subscribe({
        next: (response: AuthResponse) => {
          if (response.success) {
            this.successMessage = 'Utilisateur créé avec succès!';
            this.registerForm.reset();
            this.loadAvailableEmployees(); // Refresh the list
            
            // Optionally redirect after a delay
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 2000);
          } else {
            this.errorMessage = response.message;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onUsernameChange(): void {
    const username = this.nomUtilisateur?.value;
    if (username && username.length >= 3) {
      this.authService.checkUsernameAvailability(username).subscribe({
        next: (isAvailable: boolean) => {
          if (!isAvailable) {
            this.nomUtilisateur?.setErrors({ unavailable: true });
          }
        },
        error: (error: any) => {
          console.error('Error checking username availability:', error);
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
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
        return 'Les mots de passe ne correspondent pas';
      }
      if (errors['unavailable']) {
        return 'Ce nom d\'utilisateur n\'est pas disponible';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'nomUtilisateur': 'Le nom d\'utilisateur',
      'motDePasse': 'Le mot de passe',
      'confirmerMotDePasse': 'La confirmation du mot de passe',
      'role': 'Le rôle',
      'employeId': 'L\'employé'
    };
    return displayNames[fieldName] || fieldName;
  }

  getEmployeeName(employee: Employee): string {
    return `${employee.prenom} ${employee.nom} - ${employee.poste}`;
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }
}