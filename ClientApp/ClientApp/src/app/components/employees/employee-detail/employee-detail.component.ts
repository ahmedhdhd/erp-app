import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Employee, UpdateEmployeeRequest } from '../../../models/employee.models';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  employee: Employee | null = null;
  employeeId: number | null = null;
  isLoading = false;
  errorMessage = '';
  
  // Status options for quick updates
  statusOptions = [
    { value: 'Active', label: 'Active', class: 'success' },
    { value: 'Inactive', label: 'Inactive', class: 'secondary' },
    { value: 'On Leave', label: 'On Leave', class: 'warning' },
    { value: 'Terminated', label: 'Terminated', class: 'danger' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.employeeId = +params['id'];
      if (this.employeeId) {
        this.loadEmployee();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEmployee(): void {
    if (!this.employeeId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.employeeService.getEmployeeById(this.employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.employee = response.data;
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

  canEdit(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? ['Admin', 'HR'].includes(user.role) : false;
  }

  canDelete(): boolean {
    return this.authService.hasRole('Admin');
  }

  canUpdateStatus(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? ['Admin', 'HR', 'Manager'].includes(user.role) : false;
  }

  onEdit(): void {
    if (this.employeeId) {
      this.router.navigate(['/employees/edit', this.employeeId]);
    }
  }

  onDelete(): void {
    if (!this.employee || !this.employeeId) return;
    
    const confirmMessage = `Are you sure you want to delete employee "${this.employee.prenom} ${this.employee.nom}"? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.employeeService.deleteEmployee(this.employeeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/employees']);
          },
          error: (error) => {
            this.errorMessage = 'Failed to delete employee';
            console.error('Error deleting employee:', error);
          }
        });
    }
  }

  private updateEmployeeStatus(newStatus: string): void {
    if (!this.employee || !this.employeeId) return;
    
    const updateRequest: UpdateEmployeeRequest = {
      id: this.employee.id,
      nom: this.employee.nom,
      prenom: this.employee.prenom,
      cin: this.employee.cin,
      poste: this.employee.poste,
      departement: this.employee.departement,
      email: this.employee.email,
      telephone: this.employee.telephone,
      dateEmbauche: this.employee.dateEmbauche,
      statut: newStatus
    };
    
    this.employeeService.updateEmployee(this.employeeId, updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.employee = response.data;
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to update employee status';
          console.error('Error updating status:', error);
        }
      });
  }

  onStatusChange(newStatus: string): void {
    if (!this.employee || !this.employeeId || !this.canUpdateStatus()) return;
    this.updateEmployeeStatus(newStatus);
  }

  getStatusBadgeClass(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption ? `badge-${statusOption.class}` : 'badge-secondary';
  }

  getEmployeeAge(): number | null {
    if (!this.employee?.dateEmbauche) return null;
    
    const hireDate = new Date(this.employee.dateEmbauche);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    
    return diffYears;
  }

  getEmployeeTenure(): string {
    if (!this.employee?.dateEmbauche) return 'N/A';
    
    const hireDate = new Date(this.employee.dateEmbauche);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  onBack(): void {
    this.router.navigate(['/employees']);
  }

  onPrint(): void {
    window.print();
  }

  clearError(): void {
    this.errorMessage = '';
  }
}