import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, timer } from 'rxjs';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../../models/employee.models';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  
  // CIN validation
  isCinChecking = false;
  cinError = '';
  
  // Form validation patterns
  readonly phonePattern = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]+$/;
  readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Dropdown options
  departments = [
    'Human Resources',
    'Information Technology',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'Legal',
    'Customer Service',
    'Research and Development',
    'Quality Assurance'
  ];
  
  positions = [
    'Manager',
    'Senior Developer',
    'Developer',
    'Junior Developer',
    'Analyst',
    'Specialist',
    'Coordinator',
    'Assistant',
    'Director',
    'Team Lead',
    'Consultant',
    'Intern'
  ];
  statuses = [
    { value: 'Actif', label: 'Active' },
    { value: 'Inactif', label: 'Inactive' },
    { value: 'Suspendu', label: 'Suspended' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {
    this.employeeForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkPermissions();
    this.checkRouteParams();
    this.setupCinValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !['Admin', 'HR'].includes(currentUser.role)) {
      this.router.navigate(['/employees']);
      return;
    }
  }

  private checkRouteParams(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.employeeId = +params['id'];
        this.isEditMode = true;
        this.loadEmployee();
      }
    });
  }

  private setupCinValidation(): void {
    // Setup CIN validation with debounce
    this.employeeForm.get('cin')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value && value.length >= 8) {
        this.checkCinAvailability(value);
      } else {
        this.cinError = '';
        this.isCinChecking = false;
      }
    });
  }

  private checkCinAvailability(cin: string): void {
    // Clear previous error
    this.cinError = '';
    this.isCinChecking = true;
    
    // Debounce the API call
    timer(500).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.employeeService.isCinAvailable(cin).subscribe({
        next: (response) => {
          this.isCinChecking = false;
          if (response.success && response.data !== undefined) {
            if (!response.data && !(this.isEditMode && this.employeeForm.get('cin')?.value === cin)) {
              this.cinError = 'This CIN is already in use. Please use a different CIN.';
            }
          }
        },
        error: (error) => {
          this.isCinChecking = false;
          console.error('Error checking CIN availability:', error);
        }
      });
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      telephone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      departement: ['', [Validators.required]],
      poste: ['', [Validators.required]],
      dateEmbauche: ['', [Validators.required]],
      statut: ['Active', [Validators.required]],
      cin: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]]
    });
  }

  private loadEmployee(): void {
    if (!this.employeeId) return;
    
    this.isLoading = true;
    this.employeeService.getEmployeeById(this.employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.populateForm(response.data);
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load employee data';
          console.error('Error loading employee:', error);
          this.isLoading = false;
        }
      });
  }

  private populateForm(employee: Employee): void {
    this.employeeForm.patchValue({
      nom: employee.nom,
      prenom: employee.prenom,
      email: employee.email,
      telephone: employee.telephone,
      departement: employee.departement,
      poste: employee.poste,
      dateEmbauche: this.formatDateForInput(employee.dateEmbauche.toString()),
      statut: employee.statut,
      cin: employee.cin
    });
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.employeeForm.invalid || this.cinError) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isEditMode) {
      this.updateEmployee();
    } else {
      this.createEmployee();
    }
  }

  private createEmployee(): void {
    const formValue = this.employeeForm.value;
    const request: CreateEmployeeRequest = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      cin: formValue.cin,
      poste: formValue.poste,
      departement: formValue.departement,
      email: formValue.email,
      telephone: formValue.telephone,
      dateEmbauche: new Date(formValue.dateEmbauche),
      statut: formValue.statut
    };
    
    this.employeeService.createEmployee(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMessage = 'Employee created successfully';
          setTimeout(() => {
            this.router.navigate(['/employees']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create employee';
          this.isSubmitting = false;
        }
      });
  }

  private updateEmployee(): void {
    if (!this.employeeId) return;
    
    const formValue = this.employeeForm.value;
    const request: UpdateEmployeeRequest = {
      id: this.employeeId,
      nom: formValue.nom,
      prenom: formValue.prenom,
      cin: formValue.cin,
      poste: formValue.poste,
      departement: formValue.departement,
      email: formValue.email,
      telephone: formValue.telephone,
      dateEmbauche: new Date(formValue.dateEmbauche),
      statut: formValue.statut
    };
    
    this.employeeService.updateEmployee(this.employeeId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.successMessage = 'Employee updated successfully';
          setTimeout(() => {
            this.router.navigate(['/employees']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update employee';
          this.isSubmitting = false;
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${maxLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'email') {
          return 'Please enter a valid email address';
        }
        if (fieldName === 'telephone') {
          return 'Please enter a valid phone number';
        }
      }
      if (field.errors['min']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['max'].max}`;
      }
    }
    
    // Special handling for CIN error
    if (fieldName === 'cin' && this.cinError) {
      return this.cinError;
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      nom: 'Last Name',
      prenom: 'First Name',
      email: 'Email',
      telephone: 'Phone Number',
      departement: 'Department',
      poste: 'Position',
      dateEmbauche: 'Hire Date',
      statut: 'Status',
      cin: 'CIN'
    };
    return displayNames[fieldName] || fieldName;
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}