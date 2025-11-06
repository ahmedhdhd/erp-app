import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';
import { 
  Employee, 
  EmployeeSearchRequest, 
  EmployeeListResponse,
  DepartmentResponse,
  PositionResponse
} from '../../../models/employee.models';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  
  // Expose Math to template
  Math = Math;
  
  // Search and filter
  searchForm: FormGroup;
  showAdvancedSearch = false;
  isLoading = false;
  errorMessage = '';
  
  // Filter options
  departments: string[] = [];
  positions: string[] = [];
  statuses: string[] = [];
  
  // Selection
  selectedEmployees: number[] = [];
  selectAll = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadFilterOptions();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== INITIALIZATION ==========

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      departement: [''],
      poste: [''],
      statut: [''],
      dateEmbaucheFrom: [''],
      dateEmbaucheTo: [''],
      sortBy: ['nom'],
      sortDirection: ['asc']
    });
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadEmployees();
      });
  }

  // ========== DATA LOADING ==========

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const searchRequest: EmployeeSearchRequest = {
      ...this.searchForm.value,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    // Clean up empty values
    Object.keys(searchRequest).forEach(key => {
      if (searchRequest[key as keyof EmployeeSearchRequest] === '' || 
          searchRequest[key as keyof EmployeeSearchRequest] === null) {
        delete searchRequest[key as keyof EmployeeSearchRequest];
      }
    });

    this.employeeService.searchEmployees(searchRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            this.employees = response.data.employees;
            this.filteredEmployees = [...this.employees];
            this.totalCount = response.data.totalCount;
            this.totalPages = response.data.totalPages;
          } else {
            this.errorMessage = response.message || 'Erreur lors du chargement des employés';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Erreur lors du chargement des employés';
          console.error('Error loading employees:', error);
        }
      });
  }

  private loadFilterOptions(): void {
    // Load departments
    this.employeeService.getDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.departments = response.data;
          }
        },
        error: (error) => console.error('Error loading departments:', error)
      });

    // Load positions
    this.employeeService.getPositions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.positions = response.data;
          }
        },
        error: (error) => console.error('Error loading positions:', error)
      });

    // Load statuses
    this.employeeService.getStatuses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.statuses = response.data;
          }
        },
        error: (error) => console.error('Error loading statuses:', error)
      });
  }

  // ========== SEARCH AND FILTERING ==========

  onSearch(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  onAdvancedSearch(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchTerm: '',
      departement: '',
      poste: '',
      statut: '',
      dateEmbaucheFrom: '',
      dateEmbaucheTo: '',
      sortBy: 'nom',
      sortDirection: 'asc'
    });
    this.currentPage = 1;
    this.loadEmployees();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  // ========== SORTING ==========

  sortBy(column: string): void {
    const currentSort = this.searchForm.get('sortBy')?.value;
    const currentDirection = this.searchForm.get('sortDirection')?.value;
    
    let newDirection = 'asc';
    if (currentSort === column && currentDirection === 'asc') {
      newDirection = 'desc';
    }
    
    this.searchForm.patchValue({
      sortBy: column,
      sortDirection: newDirection
    });
    
    this.loadEmployees();
  }

  getSortIcon(column: string): string {
    const currentSort = this.searchForm.get('sortBy')?.value;
    const currentDirection = this.searchForm.get('sortDirection')?.value;
    
    if (currentSort === column) {
      return currentDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    return 'fas fa-sort';
  }

  // ========== PAGINATION ==========

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEmployees();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.loadEmployees();
  }

  get pages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ========== EMPLOYEE ACTIONS ==========

  viewEmployee(id: number): void {
    this.router.navigate(['/employees/detail', id]);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/employees/edit', id]);
  }

  deleteEmployee(employee: Employee): void {
    // Permission check
    const canDelete = this.canDeleteEmployee();
    if (!canDelete) {
      alert('Vous n\'avez pas les permissions nécessaires pour supprimer un employé.\nSeuls les administrateurs peuvent supprimer des employés.');
      return;
    }
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'employé "${employee.prenom} ${employee.nom}" ?\nCette action est irréversible.`;
    
    if (confirm(confirmMessage)) {
      this.employeeService.deleteEmployee(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Reload the employee list
              this.loadEmployees();
            } else {
              alert('Erreur lors de la suppression de l\'employé : ' + response.message);
            }
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
            alert('Erreur lors de la suppression de l\'employé. Veuillez réessayer.');
          }
        });
    }
  }

  updateEmployeeStatus(employee: Employee, newStatus: string): void {
    // Permission check
    const canUpdate = this.canEditEmployee();
    if (!canUpdate) {
      alert('Vous n\'avez pas les permissions nécessaires pour modifier le statut d\'un employé.');
      return;
    }
    
    this.employeeService.updateEmployeeStatus(employee.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Update the employee status in the list
            const index = this.employees.findIndex(e => e.id === employee.id);
            if (index !== -1) {
              this.employees[index] = { ...this.employees[index], statut: newStatus };
              this.filteredEmployees = [...this.employees];
            }
          } else {
            alert('Erreur lors de la mise à jour du statut : ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error updating employee status:', error);
          alert('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
        }
      });
  }

  // ========== SELECTION ==========
  
  toggleSelectEmployee(id: number): void {
    const index = this.selectedEmployees.indexOf(id);
    if (index === -1) {
      this.selectedEmployees.push(id);
    } else {
      this.selectedEmployees.splice(index, 1);
    }
    this.selectAll = this.selectedEmployees.length === this.employees.length && this.employees.length > 0;
  }
  
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedEmployees = this.employees.map(e => e.id);
    } else {
      this.selectedEmployees = [];
    }
  }
  
  isEmployeeSelected(id: number): boolean {
    return this.selectedEmployees.includes(id);
  }
  
  // ========== BULK ACTIONS ==========
  
  bulkDelete(): void {
    if (this.selectedEmployees.length === 0) {
      alert('Veuillez sélectionner au moins un employé à supprimer.');
      return;
    }
    
    const canDelete = this.canDeleteEmployee();
    if (!canDelete) {
      alert('Vous n\'avez pas les permissions nécessaires pour supprimer des employés.\nSeuls les administrateurs peuvent supprimer des employés.');
      return;
    }
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${this.selectedEmployees.length} employé(s) ?\nCette action est irréversible.`;
    
    if (confirm(confirmMessage)) {
      // Delete each selected employee
      let deleteCount = 0;
      let errorCount = 0;
      
      this.selectedEmployees.forEach(id => {
        this.employeeService.deleteEmployee(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              deleteCount++;
              if (deleteCount + errorCount === this.selectedEmployees.length) {
                // All requests completed
                if (errorCount === 0) {
                  alert(`${deleteCount} employé(s) supprimé(s) avec succès.`);
                } else {
                  alert(`${deleteCount} employé(s) supprimé(s) avec succès, ${errorCount} échec(s).`);
                }
                // Reload the employee list
                this.loadEmployees();
                this.selectedEmployees = [];
                this.selectAll = false;
              }
            },
            error: (error) => {
              errorCount++;
              console.error('Error deleting employee:', error);
              if (deleteCount + errorCount === this.selectedEmployees.length) {
                // All requests completed
                alert(`${deleteCount} employé(s) supprimé(s) avec succès, ${errorCount} échec(s).`);
                // Reload the employee list
                this.loadEmployees();
                this.selectedEmployees = [];
                this.selectAll = false;
              }
            }
          });
      });
    }
  }
  
  // ========== PERMISSIONS ==========
  
  canEditEmployee(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('RH');
  }
  
  canDeleteEmployee(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();
    const currentUser = this.authService.getCurrentUser();
    const hasAdminRole = this.authService.hasRole('Admin');
    
    console.log('🔍 Delete permission check:', {
      isAuthenticated: isAuthenticated,
      currentUser: currentUser,
      isAdmin: isAdmin,
      hasAdminRole: hasAdminRole,
      userRole: currentUser?.role,
      userName: currentUser?.nomUtilisateur
    });
    
    const result = isAuthenticated && isAdmin;
    console.log('🔍 Permission result:', result);
    
    return result;
  }
  
  canViewStatistics(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('RH');
  }
  
  // ========== HELPER METHODS ==========
  
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
  
  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Actif': 'bg-success',
      'Inactif': 'bg-secondary',
      'En congé': 'bg-warning',
      'Suspendu': 'bg-danger',
      'Licencié': 'bg-dark'
    };
    return statusClasses[status] || 'bg-secondary';
  }
}