import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SupplierResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierSearchRequest,
  SupplierApiResponse,
  SupplierListResponse,
  SupplierContactResponse,
  CreateSupplierContactRequest,
  UpdateSupplierContactRequest,
  SupplierStatsResponse
} from '../models/supplier.models';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly apiUrl = `${environment.apiUrl}/fournisseur`;

  private suppliersSubject = new BehaviorSubject<SupplierResponse[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public suppliers$ = this.suppliersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSuppliers(page?: number, pageSize?: number): Observable<SupplierApiResponse<SupplierListResponse>> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (pageSize !== undefined) params = params.set('pageSize', pageSize.toString());
    this.loadingSubject.next(true);
    return this.http.get<SupplierApiResponse<SupplierListResponse>>(`${this.apiUrl}`, { params }).pipe(
      tap(res => {
        if (res.success && res.data && res.data.fournisseurs) {
          this.suppliersSubject.next(res.data.fournisseurs);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  getSupplierById(id: number): Observable<SupplierApiResponse<SupplierResponse>> {
    return this.http.get<SupplierApiResponse<SupplierResponse>>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createSupplier(payload: CreateSupplierRequest): Observable<SupplierApiResponse<SupplierResponse>> {
    this.loadingSubject.next(true);
    return this.http.post<SupplierApiResponse<SupplierResponse>>(this.apiUrl, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          const current = this.suppliersSubject.value || [];
          this.suppliersSubject.next([...current, res.data]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  updateSupplier(id: number, payload: UpdateSupplierRequest): Observable<SupplierApiResponse<SupplierResponse>> {
    this.loadingSubject.next(true);
    return this.http.put<SupplierApiResponse<SupplierResponse>>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          const updated = (this.suppliersSubject.value || []).map(s => (s.id === id ? res.data! : s));
          this.suppliersSubject.next(updated);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  deleteSupplier(id: number): Observable<SupplierApiResponse<any>> {
    this.loadingSubject.next(true);
    return this.http.delete<SupplierApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      tap(res => {
        if (res.success) {
          const filtered = (this.suppliersSubject.value || []).filter(s => s.id !== id);
          this.suppliersSubject.next(filtered);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  searchSuppliers(payload: SupplierSearchRequest): Observable<SupplierApiResponse<SupplierListResponse>> {
    this.loadingSubject.next(true);
    return this.http.post<SupplierApiResponse<SupplierListResponse>>(`${this.apiUrl}/search`, payload).pipe(
      tap(res => {
        if (res.success && res.data && res.data.fournisseurs) {
          this.suppliersSubject.next(res.data.fournisseurs);
        }
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError)
    );
  }

  // Contacts
  createContact(fournisseurId: number, payload: CreateSupplierContactRequest): Observable<SupplierApiResponse<SupplierContactResponse>> {
    return this.http
      .post<SupplierApiResponse<SupplierContactResponse>>(`${this.apiUrl}/${fournisseurId}/contacts`, payload)
      .pipe(catchError(this.handleError));
  }

  updateContact(payload: UpdateSupplierContactRequest): Observable<SupplierApiResponse<SupplierContactResponse>> {
    return this.http
      .put<SupplierApiResponse<SupplierContactResponse>>(`${this.apiUrl}/contacts`, payload)
      .pipe(catchError(this.handleError));
  }

  deleteContact(id: number): Observable<SupplierApiResponse<any>> {
    return this.http.delete<SupplierApiResponse<any>>(`${this.apiUrl}/contacts/${id}`).pipe(catchError(this.handleError));
  }

  // Stats & utility
  getSupplierStats(): Observable<SupplierApiResponse<SupplierStatsResponse>> {
    return this.http.get<SupplierApiResponse<SupplierStatsResponse>>(`${this.apiUrl}/statistics`).pipe(catchError(this.handleError));
  }

  getSupplierTypes(): Observable<SupplierApiResponse<string[]>> {
    return this.http.get<SupplierApiResponse<string[]>>(`${this.apiUrl}/types`).pipe(catchError(this.handleError));
  }

  getCities(): Observable<SupplierApiResponse<string[]>> {
    return this.http.get<SupplierApiResponse<string[]>>(`${this.apiUrl}/cities`).pipe(catchError(this.handleError));
  }

  getPaymentTerms(): Observable<SupplierApiResponse<string[]>> {
    return this.http
      .get<SupplierApiResponse<string[]>>(`${this.apiUrl}/payment-terms`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Supplier API error', error);
    const message = error?.error?.message || error?.message || 'Erreur inattendue';
    return throwError(() => new Error(message));
  }
}


