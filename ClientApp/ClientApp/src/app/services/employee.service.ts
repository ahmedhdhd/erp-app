import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { 
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeSearchRequest,
  EmployeeListResponse,
  EmployeeStatsResponse,
  DepartmentResponse,
  PositionResponse,
  EmployeeApiResponse
} from '../models/employee.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly apiUrl = `${environment.apiUrl}/employee`;

  constructor(private http: HttpClient) {}

  // ========== EMPLOYEE CRUD OPERATIONS ==========

  /**
   * Get all employees with simple pagination
   */
  getAllEmployees(page: number = 1, pageSize: number = 50, searchTerm?: string): Observable<EmployeeApiResponse<EmployeeListResponse>> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    
    return this.http.get<EmployeeApiResponse<EmployeeListResponse>>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Search employees with advanced filtering
   */
  searchEmployees(searchRequest: EmployeeSearchRequest): Observable<EmployeeApiResponse<EmployeeListResponse>> {
    return this.http.post<EmployeeApiResponse<EmployeeListResponse>>(`${this.apiUrl}/search`, searchRequest)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(id: number): Observable<EmployeeApiResponse<Employee>> {
    return this.http.get<EmployeeApiResponse<Employee>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new employee
   */
  createEmployee(request: CreateEmployeeRequest): Observable<EmployeeApiResponse<Employee>> {
    return this.http.post<EmployeeApiResponse<Employee>>(this.apiUrl, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update existing employee
   */
  updateEmployee(id: number, request: UpdateEmployeeRequest): Observable<EmployeeApiResponse<Employee>> {
    return this.http.put<EmployeeApiResponse<Employee>>(`${this.apiUrl}/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete employee
   */
  deleteEmployee(id: number): Observable<EmployeeApiResponse<boolean>> {
    console.log('🚀 EmployeeService.deleteEmployee called with ID:', id);
    
    const url = `${this.apiUrl}/${id}`;
    console.log('🌐 API URL for delete:', url);
    
    // Check if we have authentication headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'NO_TOKEN'}`
    });
    
    console.log('🔑 Request headers:', {
      'Content-Type': headers.get('Content-Type'),
      'Authorization': headers.get('Authorization')?.substring(0, 20) + '...' || 'NO_AUTH_HEADER'
    });
    
    return this.http.delete<EmployeeApiResponse<boolean>>(url, { headers })
      .pipe(
        tap((response: EmployeeApiResponse<boolean>) => {
          console.log('✅ Delete service - Success response:', response);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Delete service - Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error,
            message: error.message,
            headers: error.headers?.keys()?.map(key => ({ [key]: error.headers?.get(key) }))
          });
          
          return this.handleError(error);
        })
      );
  }

  /**
   * Update employee status
   */
  updateEmployeeStatus(id: number, newStatus: string): Observable<EmployeeApiResponse<boolean>> {
    return this.http.patch<EmployeeApiResponse<boolean>>(`${this.apiUrl}/${id}/status`, JSON.stringify(newStatus), {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(catchError(this.handleError));
  }

  // ========== STATISTICS AND REPORTS ==========

  /**
   * Get employee statistics
   */
  getEmployeeStats(): Observable<EmployeeApiResponse<EmployeeStatsResponse>> {
    return this.http.get<EmployeeApiResponse<EmployeeStatsResponse>>(`${this.apiUrl}/statistics`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get department statistics
   */
  getDepartmentStats(): Observable<EmployeeApiResponse<DepartmentResponse[]>> {
    return this.http.get<EmployeeApiResponse<DepartmentResponse[]>>(`${this.apiUrl}/statistics/departments`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get position statistics
   */
  getPositionStats(): Observable<EmployeeApiResponse<PositionResponse[]>> {
    return this.http.get<EmployeeApiResponse<PositionResponse[]>>(`${this.apiUrl}/statistics/positions`)
      .pipe(catchError(this.handleError));
  }

  // ========== UTILITY METHODS ==========

  /**
   * Get all departments
   */
  getDepartments(): Observable<EmployeeApiResponse<string[]>> {
    return this.http.get<EmployeeApiResponse<string[]>>(`${this.apiUrl}/departments`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all positions
   */
  getPositions(): Observable<EmployeeApiResponse<string[]>> {
    return this.http.get<EmployeeApiResponse<string[]>>(`${this.apiUrl}/positions`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all statuses
   */
  getStatuses(): Observable<EmployeeApiResponse<string[]>> {
    return this.http.get<EmployeeApiResponse<string[]>>(`${this.apiUrl}/statuses`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Export employees to CSV
   */
  exportToCsv(searchRequest: EmployeeSearchRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/csv`, searchRequest, {
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Check if CIN is available
   */
  isCinAvailable(cin: string): Observable<EmployeeApiResponse<boolean>> {
    return this.http.get<EmployeeApiResponse<boolean>>(`${this.apiUrl}/cin-available/${encodeURIComponent(cin)}`)
      .pipe(catchError(this.handleError));
  }

  // ========== HELPER METHODS ==========

  /**
   * Download CSV file
   */
  downloadCsv(blob: Blob, filename: string = 'employees.csv'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Format salary for display
   */
  formatSalary(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Actif': 'bg-success',
      'Inactif': 'bg-secondary',
      'Suspendu': 'bg-warning',
      'En congé': 'bg-info',
      'Démission': 'bg-dark',
      'Licencié': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  /**
   * Validate employee form data
   */
  validateEmployeeData(data: any): string[] {
    const errors: string[] = [];

    if (!data.nom || data.nom.trim().length === 0) {
      errors.push('Le nom est obligatoire');
    }
    if (!data.prenom || data.prenom.trim().length === 0) {
      errors.push('Le prénom est obligatoire');
    }
    if (!data.cin || data.cin.trim().length === 0) {
      errors.push('Le CIN est obligatoire');
    }
    if (!data.poste || data.poste.trim().length === 0) {
      errors.push('Le poste est obligatoire');
    }
    if (!data.departement || data.departement.trim().length === 0) {
      errors.push('Le département est obligatoire');
    }
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Format d\'email invalide');
    }
    if (data.salaireBase < 0) {
      errors.push('Le salaire de base doit être positif');
    }
    if (data.prime < 0) {
      errors.push('La prime doit être positive');
    }
    if (!data.dateEmbauche) {
      errors.push('La date d\'embauche est obligatoire');
    } else if (new Date(data.dateEmbauche) > new Date()) {
      errors.push('La date d\'embauche ne peut pas être dans le futur');
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Non autorisé - Veuillez vous reconnecter';
      } else if (error.status === 403) {
        errorMessage = 'Accès refusé - Permissions insuffisantes';
      } else if (error.status === 404) {
        errorMessage = 'Ressource introuvable';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur interne';
      }
    }

    console.error('Employee Service Error:', error);
    return throwError({ message: errorMessage, status: error.status });
  };
}