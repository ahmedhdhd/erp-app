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
      salaireMin: [''],
      salaireMax: [''],
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
      salaireMin: '',
      salaireMax: '',
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

    // Create nomComplet if it doesn't exist
    const employeeName = employee.nomComplet || `${employee.prenom} ${employee.nom}`;
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'employé ${employeeName} ?\n\n` +
      `⚠️ Cette action changera le statut de l'employé à "Inactif".\n` +
      `${employee.hasUserAccount ? '⚠️ ATTENTION: Cet employé a un compte utilisateur associé!' : '✓ Aucun compte utilisateur associé.'}`;
    
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      
      this.employeeService.deleteEmployee(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            
            if (response.success) {
              alert(`✅ Employé désactivé avec succès!\n${response.message || 'Le statut a été changé à "Inactif"'}`);
              this.loadEmployees(); // Refresh the list
            } else {
              alert(`❌ Échec de la désactivation:\n${response.message || 'Erreur inconnue du serveur'}`);
            }
          },
          error: (error) => {
            this.isLoading = false;
            
            let errorMessage = 'Erreur lors de la désactivation';
            let debugInfo = '';
            
            if (error.status === 0) {
              errorMessage = 'Impossible de contacter le serveur. Vérifiez que l\'API est démarrée.';
              debugInfo = 'Status 0 - API inaccessible';
            } else if (error.status === 401) {
              errorMessage = 'Non autorisé - Votre session a expiré. Veuillez vous reconnecter.';
              debugInfo = 'Status 401 - Unauthorized';
            } else if (error.status === 403) {
              errorMessage = 'Accès refusé - Seuls les administrateurs peuvent supprimer des employés.';
              debugInfo = 'Status 403 - Forbidden';
            } else if (error.status === 404) {
              errorMessage = 'Employé non trouvé ou déjà supprimé.';
              debugInfo = 'Status 404 - Not Found';
            } else if (error.status === 400) {
              errorMessage = error.error?.message || 'Requête invalide';
              debugInfo = 'Status 400 - Bad Request';
            } else if (error.status === 500) {
              errorMessage = 'Erreur serveur interne. Contactez l\'administrateur.';
              debugInfo = 'Status 500 - Internal Server Error';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
              debugInfo = `Status ${error.status} - Custom error`;
            } else if (error.message) {
              errorMessage = error.message;
              debugInfo = `Status ${error.status} - HTTP error`;
            }
            
            alert(`❌ Erreur lors de la désactivation:\n${errorMessage}\n\n🔧 Info technique: ${debugInfo}`);
          }
        });
    }
  }

  updateEmployeeStatus(employee: Employee, newStatus: string): void {
    this.employeeService.updateEmployeeStatus(employee.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            employee.statut = newStatus;
          } else {
            alert('Erreur lors de la mise à jour: ' + response.message);
          }
        },
        error: (error) => {
          alert('Erreur lors de la mise à jour: ' + error.message);
        }
      });
  }

  // ========== BULK OPERATIONS ==========

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedEmployees = this.employees.map(emp => emp.id);
    } else {
      this.selectedEmployees = [];
    }
  }

  toggleSelectEmployee(employeeId: number): void {
    const index = this.selectedEmployees.indexOf(employeeId);
    if (index > -1) {
      this.selectedEmployees.splice(index, 1);
    } else {
      this.selectedEmployees.push(employeeId);
    }
    this.selectAll = this.selectedEmployees.length === this.employees.length;
  }

  isEmployeeSelected(employeeId: number): boolean {
    return this.selectedEmployees.includes(employeeId);
  }

  // ========== EXPORT ==========

  exportToCsv(): void {
    const searchRequest: EmployeeSearchRequest = {
      ...this.searchForm.value,
      page: 1,
      pageSize: 10000 // Export all matching records
    };

    this.employeeService.exportToCsv(searchRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const filename = `employees_${new Date().toISOString().split('T')[0]}.csv`;
          this.employeeService.downloadCsv(blob, filename);
        },
        error: (error) => {
          alert('Erreur lors de l\'export: ' + error.message);
        }
      });
  }

  // ========== UTILITY METHODS ==========

  formatSalary(amount: number): string {
    return this.employeeService.formatSalary(amount);
  }

  formatDate(date: Date | string): string {
    return this.employeeService.formatDate(date);
  }

  getStatusBadgeClass(status: string): string {
    return this.employeeService.getStatusBadgeClass(status);
  }

  canCreateEmployee(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('RH');
  }

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
}