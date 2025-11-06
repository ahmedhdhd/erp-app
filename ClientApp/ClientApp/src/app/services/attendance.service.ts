import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Attendance {
  id: number;
  employeId: number;
  employe?: Employee;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  hoursWorked?: number;
  overtimeHours?: number;
  status: string;
  notes?: string;
  dateCreation: string;
  dateModification?: string;
}

export interface Employee {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  poste: string;
  departement: string;
  email: string;
  telephone: string;
  dateEmbauche: string;
  statut: string;
}

export interface AttendanceListResponse {
  attendances: Attendance[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AttendanceSearchRequest {
  dateFrom?: string;
  dateTo?: string;
  employeId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface CreateAttendanceRequest {
  employeId: number;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  status?: string;
  notes?: string;
}

export interface UpdateAttendanceRequest extends CreateAttendanceRequest {
  id: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly baseUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  // ---- Attendance Management ----
  getAllAttendances(page: number = 1, pageSize: number = 50): Observable<AttendanceListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<AttendanceListResponse>>(`${this.baseUrl}`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  searchAttendances(query: AttendanceSearchRequest): Observable<AttendanceListResponse> {
    let params = new HttpParams();
    
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    if (query.employeId) params = params.set('employeId', query.employeId.toString());
    if (query.status) params = params.set('status', query.status);
    if (query.page) params = params.set('page', query.page.toString());
    if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortDirection) params = params.set('sortDirection', query.sortDirection);

    return this.http.get<ApiResponse<AttendanceListResponse>>(`${this.baseUrl}/search`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getAttendance(id: number): Observable<Attendance> {
    return this.http.get<ApiResponse<Attendance>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getAttendanceByEmployeeAndDate(employeId: number, date: string): Observable<Attendance> {
    return this.http.get<ApiResponse<Attendance>>(`${this.baseUrl}/employee/${employeId}/date/${date}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  createAttendance(data: CreateAttendanceRequest): Observable<Attendance> {
    return this.http.post<ApiResponse<Attendance>>(`${this.baseUrl}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  updateAttendance(id: number, data: UpdateAttendanceRequest): Observable<Attendance> {
    return this.http.put<ApiResponse<Attendance>>(`${this.baseUrl}/${id}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  deleteAttendance(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => response.success),
        catchError(this.handleError)
      );
  }

  // ---- Error handler ----
  private handleError(error: HttpErrorResponse) {
    console.error('AttendanceService error:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}