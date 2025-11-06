import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface SituationFamiliale {
  id: number;
  employeId: number;
  etatCivil: string;
  chefDeFamille: boolean;
  nombreEnfants: number;
  enfantsEtudiants: number;
  enfantsHandicapes: number;
  parentsACharge: number;
  conjointACharge: boolean;
  dateDerniereMaj: string;
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
  salaireBase: number;
  prime: number;
  dateEmbauche: string;
  statut: string;
}

export interface EtatDePaie {
  id: number;
  employeId: number;
  employe?: Employee;
  mois: string;
  nombreDeJours: number;
  salaireBase: number;
  primePresence: number;
  primeProduction: number;
  salaireBrut: number;
  cnss: number;
  salaireImposable: number;
  irpp: number;
  css: number;
  salaireNet: number;
  dateCreation: string;
  // Family situation information
  etatCivil?: string;
  chefDeFamille?: boolean;
  nombreEnfants?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface EtatDePaieListResponse {
  etatsDePaie: EtatDePaie[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
   private readonly baseUrl = `${environment.apiUrl}/payroll`;

  constructor(private http: HttpClient) {}

  // ---- Situation Familiale ----
  getSituationFamiliale(employeId: number): Observable<SituationFamiliale> {
    return this.http.get<ApiResponse<SituationFamiliale>>(`${this.baseUrl}/situationfamiliale/${employeId}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  createSituationFamiliale(data: Partial<SituationFamiliale>): Observable<SituationFamiliale> {
    return this.http.post<ApiResponse<SituationFamiliale>>(`${this.baseUrl}/situationfamiliale`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  updateSituationFamiliale(id: number, data: Partial<SituationFamiliale>): Observable<SituationFamiliale> {
    return this.http.put<ApiResponse<SituationFamiliale>>(`${this.baseUrl}/situationfamiliale/${id}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  deleteSituationFamiliale(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/situationfamiliale/${id}`)
      .pipe(
        map(response => response.success),
        catchError(this.handleError)
      );
  }

  // ---- Etat de Paie ----
  getAllEtatsDePaie(page: number = 1, pageSize: number = 50): Observable<EtatDePaieListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<EtatDePaieListResponse>>(`${this.baseUrl}/etatdepaie`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  searchEtatsDePaie(query: {
    mois?: string;
    employeId?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Observable<EtatDePaieListResponse> {
    let params = new HttpParams();
    
    if (query.mois) params = params.set('mois', query.mois);
    if (query.employeId) params = params.set('employeId', query.employeId.toString());
    if (query.page) params = params.set('page', query.page.toString());
    if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortDirection) params = params.set('sortDirection', query.sortDirection);

    return this.http.get<ApiResponse<EtatDePaieListResponse>>(`${this.baseUrl}/etatdepaie/search`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getEtatDePaie(id: number): Observable<EtatDePaie> {
    return this.http.get<ApiResponse<EtatDePaie>>(`${this.baseUrl}/etatdepaie/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getEtatsDePaieByEmploye(employeId: number): Observable<EtatDePaie[]> {
    return this.http.get<ApiResponse<EtatDePaie[]>>(`${this.baseUrl}/etatdepaie/employe/${employeId}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  createEtatDePaie(data: Partial<EtatDePaie>): Observable<EtatDePaie> {
    return this.http.post<ApiResponse<EtatDePaie>>(`${this.baseUrl}/etatdepaie`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  generatePayrollForAllEmployees(mois: string): Observable<EtatDePaie[]> {
    const params = new HttpParams().set('mois', mois);
    return this.http.post<ApiResponse<EtatDePaie[]>>(`${this.baseUrl}/etatdepaie/generate-all`, {}, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  updateEtatDePaie(id: number, data: Partial<EtatDePaie>): Observable<EtatDePaie> {
    return this.http.put<ApiResponse<EtatDePaie>>(`${this.baseUrl}/etatdepaie/${id}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  deleteEtatDePaie(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/etatdepaie/${id}`)
      .pipe(
        map(response => response.success),
        catchError(this.handleError)
      );
  }

  // ---- Error handler ----
  private handleError(error: HttpErrorResponse) {
    console.error('PayrollService error:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}