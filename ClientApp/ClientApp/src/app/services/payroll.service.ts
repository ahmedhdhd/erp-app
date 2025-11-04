import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Import models if/when created in models folder

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

export interface EtatDePaie {
  id: number;
  employeId: number;
  employe?: any;
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
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private baseUrl = '/api/payroll';

  constructor(private http: HttpClient) {}

  // ---- Situation Familiale ----
  getSituationFamiliale(employeId: number): Observable<SituationFamiliale> {
    return this.http.get<SituationFamiliale>(`${this.baseUrl}/situationfamiliale/${employeId}`)
      .pipe(catchError(this.handleError));
  }
  createSituationFamiliale(data: Partial<SituationFamiliale>): Observable<any> {
    return this.http.post(`${this.baseUrl}/situationfamiliale`, data)
      .pipe(catchError(this.handleError));
  }
  updateSituationFamiliale(id: number, data: Partial<SituationFamiliale>): Observable<any> {
    return this.http.put(`${this.baseUrl}/situationfamiliale/${id}`, data)
      .pipe(catchError(this.handleError));
  }
  deleteSituationFamiliale(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/situationfamiliale/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ---- Etat de Paie ----
  getAllEtatsDePaie(page: number = 1, pageSize: number = 50): Observable<any> {
    return this.http.get(`${this.baseUrl}/etatdepaie?page=${page}&pageSize=${pageSize}`)
      .pipe(catchError(this.handleError));
  }
  searchEtatsDePaie(query: any): Observable<any> {
    const params = new URLSearchParams(query).toString();
    return this.http.get(`${this.baseUrl}/etatdepaie/search?${params}`)
      .pipe(catchError(this.handleError));
  }
  getEtatDePaie(id: number): Observable<EtatDePaie> {
    return this.http.get<EtatDePaie>(`${this.baseUrl}/etatdepaie/${id}`)
      .pipe(catchError(this.handleError));
  }
  getEtatsDePaieByEmploye(employeId: number): Observable<EtatDePaie[]> {
    return this.http.get<EtatDePaie[]>(`${this.baseUrl}/etatdepaie/employe/${employeId}`)
      .pipe(catchError(this.handleError));
  }
  createEtatDePaie(data: Partial<EtatDePaie>): Observable<any> {
    return this.http.post(`${this.baseUrl}/etatdepaie`, data)
      .pipe(catchError(this.handleError));
  }
  updateEtatDePaie(id: number, data: Partial<EtatDePaie>): Observable<any> {
    return this.http.put(`${this.baseUrl}/etatdepaie/${id}`, data)
      .pipe(catchError(this.handleError));
  }
  deleteEtatDePaie(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/etatdepaie/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ---- Error handler ----
  private handleError(error: HttpErrorResponse) {
    console.error('PayrollService error:', error);
    return throwError(() => error);
  }
}
