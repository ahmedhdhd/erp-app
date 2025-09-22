import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  ClientResponse, 
  CreateClientRequest, 
  UpdateClientRequest,
  ClientSearchRequest,
  ClientApiResponse,
  ClientListResponse,
  ContactClientResponse,
  CreateContactClientRequest,
  UpdateContactClientRequest,
  ClientStatsResponse
} 
from '../models/client.models';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = `${environment.apiUrl}/client`;

  // State management
  private clientsSubject = new BehaviorSubject<ClientResponse[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public clients$ = this.clientsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  // ==================== CLIENT OPERATIONS ====================

  /**
   * Get all clients with optional pagination
   */
  getClients(page?: number, pageSize?: number): Observable<ClientApiResponse<ClientListResponse>> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (pageSize !== undefined) params = params.set('pageSize', pageSize.toString());

    this.loadingSubject.next(true);
    return this.http.get<ClientApiResponse<ClientListResponse>>(`${this.apiUrl}`, { params })
      .pipe(
        tap(response => {
          if (response.success && response.data && response.data.clients) {
            this.clientsSubject.next(response.data.clients);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get client by ID
   */
  getClientById(id: number): Observable<ClientApiResponse<ClientResponse>> {
    return this.http.get<ClientApiResponse<ClientResponse>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new client
   */
  createClient(client: CreateClientRequest): Observable<ClientApiResponse<ClientResponse>> {
    this.loadingSubject.next(true);
    return this.http.post<ClientApiResponse<ClientResponse>>(this.apiUrl, client)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const currentClients = this.clientsSubject.value;
            if (currentClients) {
              this.clientsSubject.next([...currentClients, response.data]);
            }
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing client
   */
  updateClient(id: number, client: UpdateClientRequest): Observable<ClientApiResponse<ClientResponse>> {
    this.loadingSubject.next(true);
    return this.http.put<ClientApiResponse<ClientResponse>>(`${this.apiUrl}/${id}`, client)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const currentClients = this.clientsSubject.value;
            if (currentClients) {
              const updatedClients = currentClients.map(c => 
                c.id === id ? response.data! : c
              );
              this.clientsSubject.next(updatedClients);
            }
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete client (soft delete)
   */
  deleteClient(id: number): Observable<ClientApiResponse<any>> {
    this.loadingSubject.next(true);
    return this.http.delete<ClientApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => {
          if (response.success) {
            const currentClients = this.clientsSubject.value;
            if (currentClients) {
              const filteredClients = currentClients.filter(c => c.id !== id);
              this.clientsSubject.next(filteredClients);
            }
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Search clients with filters
   */
  searchClients(searchRequest: ClientSearchRequest): Observable<ClientApiResponse<ClientListResponse>> {
    this.loadingSubject.next(true);
    return this.http.post<ClientApiResponse<ClientListResponse>>(`${this.apiUrl}/search`, searchRequest)
      .pipe(
        tap(response => {
          if (response.success && response.data && response.data.clients) {
            this.clientsSubject.next(response.data.clients);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError)
      );
  }

  // ==================== CONTACT OPERATIONS ====================

  /**
   * Create new contact for a client
   */
  createContact(clientId: number, contact: CreateContactClientRequest): Observable<ClientApiResponse<ContactClientResponse>> {
    return this.http.post<ClientApiResponse<ContactClientResponse>>(`${this.apiUrl}/${clientId}/contacts`, contact)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update existing contact
   */
  updateContact(contact: UpdateContactClientRequest): Observable<ClientApiResponse<ContactClientResponse>> {
    return this.http.put<ClientApiResponse<ContactClientResponse>>(`${this.apiUrl}/contacts`, contact)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete contact
   */
  deleteContact(id: number): Observable<ClientApiResponse<any>> {
    return this.http.delete<ClientApiResponse<any>>(`${this.apiUrl}/contacts/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ==================== STATISTICS AND UTILITY ====================

  /**
   * Get client statistics
   */
  getClientStats(): Observable<ClientApiResponse<ClientStatsResponse>> {
    return this.http.get<ClientApiResponse<ClientStatsResponse>>(`${this.apiUrl}/statistics`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all client types
   */
  getClientTypes(): Observable<ClientApiResponse<string[]>> {
    return this.http.get<ClientApiResponse<string[]>>(`${this.apiUrl}/types`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all classifications
   */
  getClassifications(): Observable<ClientApiResponse<string[]>> {
    return this.http.get<ClientApiResponse<string[]>>(`${this.apiUrl}/classifications`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all cities
   */
  getCities(): Observable<ClientApiResponse<string[]>> {
    return this.http.get<ClientApiResponse<string[]>>(`${this.apiUrl}/cities`)
      .pipe(catchError(this.handleError));
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    let errorMessage = 'An error occurred while processing your request';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}