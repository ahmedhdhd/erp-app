import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Account,
  CreateAccountDTO,
  UpdateAccountDTO,
  Journal,
  CreateJournalDTO,
  UpdateJournalDTO,
  Partner,
  CreatePartnerDTO,
  UpdatePartnerDTO,
  Invoice,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  Payment,
  CreatePaymentDTO,
  UpdatePaymentDTO,
  VAT,
  CreateVATDTO,
  UpdateVATDTO,
  FinancialSearchDTO,
  FinancialDashboardDTO,
  PaginatedResponse
} from '../models/financial.models';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private readonly baseUrl = `${environment.apiUrl}/api/financial`;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<FinancialDashboardDTO> {
    return this.http.get<FinancialDashboardDTO>(`${this.baseUrl}/dashboard`);
  }

  // Accounts
  getAccounts(searchDTO?: FinancialSearchDTO): Observable<Account[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = searchDTO[key as keyof FinancialSearchDTO];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`, { params });
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${id}`);
  }

  createAccount(account: CreateAccountDTO): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, account);
  }

  updateAccount(id: number, account: UpdateAccountDTO): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/accounts/${id}`, account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/accounts/${id}`);
  }

  // Journals
  getJournals(searchDTO?: FinancialSearchDTO): Observable<Journal[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = searchDTO[key as keyof FinancialSearchDTO];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Journal[]>(`${this.baseUrl}/journals`, { params });
  }

  getJournalById(id: number): Observable<Journal> {
    return this.http.get<Journal>(`${this.baseUrl}/journals/${id}`);
  }

  createJournal(journal: CreateJournalDTO): Observable<Journal> {
    return this.http.post<Journal>(`${this.baseUrl}/journals`, journal);
  }

  updateJournal(id: number, journal: UpdateJournalDTO): Observable<Journal> {
    return this.http.put<Journal>(`${this.baseUrl}/journals/${id}`, journal);
  }

  // Partners
  getPartners(searchDTO?: FinancialSearchDTO): Observable<Partner[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = searchDTO[key as keyof FinancialSearchDTO];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Partner[]>(`${this.baseUrl}/partners`, { params });
  }

  getPartnerById(id: number): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/partners/${id}`);
  }

  createPartner(partner: CreatePartnerDTO): Observable<Partner> {
    return this.http.post<Partner>(`${this.baseUrl}/partners`, partner);
  }

  updatePartner(id: number, partner: UpdatePartnerDTO): Observable<Partner> {
    return this.http.put<Partner>(`${this.baseUrl}/partners/${id}`, partner);
  }

  // Invoices
  getInvoices(searchDTO?: FinancialSearchDTO): Observable<Invoice[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = searchDTO[key as keyof FinancialSearchDTO];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`, { params });
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
  }

  createInvoice(invoice: CreateInvoiceDTO): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices`, invoice);
  }

  updateInvoice(id: number, invoice: UpdateInvoiceDTO): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/invoices/${id}`, invoice);
  }

  validateInvoice(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/invoices/${id}/validate`, {});
  }

  // Payments
  getPayments(searchDTO?: FinancialSearchDTO): Observable<Payment[]> {
    let params = new HttpParams();
    if (searchDTO) {
      Object.keys(searchDTO).forEach(key => {
        const value = searchDTO[key as keyof FinancialSearchDTO];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Payment[]>(`${this.baseUrl}/payments`, { params });
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payments/${id}`);
  }

  createPayment(payment: CreatePaymentDTO): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments`, payment);
  }

  updatePayment(id: number, payment: UpdatePaymentDTO): Observable<Payment> {
    return this.http.put<Payment>(`${this.baseUrl}/payments/${id}`, payment);
  }

  validatePayment(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/payments/${id}/validate`, {});
  }

  // Utility methods for formatting
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-TN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  }

  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-TN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  // Get enum display values
  getAccountTypeDisplay(type: number): string {
    const types = {
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
    return types[type as keyof typeof types] || 'Inconnu';
  }

  getJournalTypeDisplay(type: number): string {
    const types = {
      1: 'Ventes',
      2: 'Achats',
      3: 'Banque',
      4: 'Caisse',
      5: 'Divers'
    };
    return types[type as keyof typeof types] || 'Inconnu';
  }

  getPartnerTypeDisplay(type: number): string {
    const types = {
      1: 'Client',
      2: 'Fournisseur',
      3: 'Client/Fournisseur'
    };
    return types[type as keyof typeof types] || 'Inconnu';
  }

  getInvoiceTypeDisplay(type: number): string {
    const types = {
      1: 'Vente',
      2: 'Achat',
      3: 'Avoir',
      4: 'Note de débit'
    };
    return types[type as keyof typeof types] || 'Inconnu';
  }

  getInvoiceStatusDisplay(status: number): string {
    const statuses = {
      1: 'Brouillon',
      2: 'Validé',
      3: 'Comptabilisé',
      4: 'Payé',
      5: 'Partiel',
      6: 'Annulé'
    };
    return statuses[status as keyof typeof statuses] || 'Inconnu';
  }

  getPaymentTypeDisplay(type: number): string {
    const types = {
      1: 'Encaissement',
      2: 'Décaissement'
    };
    return types[type as keyof typeof types] || 'Inconnu';
  }

  getPaymentStatusDisplay(status: number): string {
    const statuses = {
      1: 'Brouillon',
      2: 'Validé',
      3: 'Comptabilisé',
      4: 'Annulé'
    };
    return statuses[status as keyof typeof statuses] || 'Inconnu';
  }

  getPaymentMethodDisplay(method: number): string {
    const methods = {
      1: 'Espèces',
      2: 'Virement',
      3: 'Chèque',
      4: 'Carte de crédit',
      5: 'Autre'
    };
    return methods[method as keyof typeof methods] || 'Inconnu';
  }

  // Get status badge classes
  getStatusBadgeClass(status: boolean | number): string {
    if (typeof status === 'boolean') {
      return status ? 'badge bg-success' : 'badge bg-danger';
    }
    
    const statusClasses = {
      1: 'badge bg-secondary', // Draft
      2: 'badge bg-warning',   // Validated
      3: 'badge bg-success',   // Posted/Paid
      4: 'badge bg-success',   // Paid
      5: 'badge bg-info',      // Partial
      6: 'badge bg-danger'     // Cancelled
    };
    return statusClasses[status as keyof typeof statusClasses] || 'badge bg-secondary';
  }
}

