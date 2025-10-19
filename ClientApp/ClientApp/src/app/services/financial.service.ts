import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Account, CreateAccountDTO, UpdateAccountDTO,
  Journal, CreateJournalDTO, UpdateJournalDTO,
  Partner, CreatePartnerDTO, UpdatePartnerDTO,
  Invoice, CreateInvoiceDTO, UpdateInvoiceDTO,
  Payment, CreatePaymentDTO, UpdatePaymentDTO,
  FinancialSearchDTO, FinancialDashboardDTO
} from '../models/financial.models';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private baseUrl = '/api/financial';

  constructor(private http: HttpClient) { }

  /**
   * Get display text for account type
   * @param type Account type enum value
   * @returns Display text for the account type
   */
  getAccountTypeDisplay(type: number): string {
    const accountTypeMap: { [key: number]: string } = {
      1: 'Actif',
      2: 'Passif',
      3: 'Capitaux propres',
      4: 'Produits',
      5: 'Charges',
      6: 'TVA',
      7: 'Banque',
      8: 'Caisse',
      9: 'Clients',
      10: 'Fournisseurs'
    };
    return accountTypeMap[type] || 'Inconnu';
  }

  /**
   * Format currency amount
   * @param amount Amount to format
   * @returns Formatted currency string
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3
    }).format(amount);
  }

  /**
   * Format date
   * @param date Date to format
   * @returns Formatted date string
   */
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-TN');
  }

  /**
   * Get status badge class
   * @param isActive Status flag
   * @returns CSS class for badge
   */
  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge bg-success' : 'badge bg-secondary';
  }

  // Dashboard
  getDashboardData(): Observable<FinancialDashboardDTO> {
    return this.http.get<FinancialDashboardDTO>(`${this.baseUrl}/dashboard`);
  }

  getDashboard(): Observable<FinancialDashboardDTO> {
    return this.getDashboardData();
  }

  // Accounts
  getAccounts(searchDTO?: FinancialSearchDTO): Observable<Account[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = (searchDTO as any)[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`, { params });
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${id}`);
  }

  createAccount(createDTO: CreateAccountDTO): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, createDTO);
  }

  updateAccount(id: number, updateDTO: UpdateAccountDTO): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/accounts/${id}`, updateDTO);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/accounts/${id}`);
  }

  // Journals
  getJournals(searchDTO?: FinancialSearchDTO): Observable<Journal[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = (searchDTO as any)[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Journal[]>(`${this.baseUrl}/journals`, { params });
  }

  getJournalById(id: number): Observable<Journal> {
    return this.http.get<Journal>(`${this.baseUrl}/journals/${id}`);
  }

  createJournal(createDTO: CreateJournalDTO): Observable<Journal> {
    return this.http.post<Journal>(`${this.baseUrl}/journals`, createDTO);
  }

  updateJournal(id: number, updateDTO: UpdateJournalDTO): Observable<Journal> {
    return this.http.put<Journal>(`${this.baseUrl}/journals/${id}`, updateDTO);
  }

  // Partners
  getPartners(searchDTO?: FinancialSearchDTO): Observable<Partner[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = (searchDTO as any)[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Partner[]>(`${this.baseUrl}/partners`, { params });
  }

  getPartnerById(id: number): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/partners/${id}`);
  }

  createPartner(createDTO: CreatePartnerDTO): Observable<Partner> {
    return this.http.post<Partner>(`${this.baseUrl}/partners`, createDTO);
  }

  updatePartner(id: number, updateDTO: UpdatePartnerDTO): Observable<Partner> {
    return this.http.put<Partner>(`${this.baseUrl}/partners/${id}`, updateDTO);
  }

  // Invoices
  getInvoices(searchDTO?: FinancialSearchDTO): Observable<Invoice[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = (searchDTO as any)[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`, { params });
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
  }

  createInvoice(createDTO: CreateInvoiceDTO): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices`, createDTO);
  }

  validateInvoice(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/invoices/${id}/validate`, {});
  }

  // Payments
  getPayments(searchDTO?: FinancialSearchDTO): Observable<Payment[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = (searchDTO as any)[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Payment[]>(`${this.baseUrl}/payments`, { params });
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payments/${id}`);
  }

  createPayment(createDTO: CreatePaymentDTO): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments`, createDTO);
  }

  validatePayment(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/payments/${id}/validate`, {});
  }
}