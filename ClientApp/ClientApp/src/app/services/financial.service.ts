import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import {
  Account,
  CreateAccount,
  UpdateAccount,
  JournalEntry,
  CreateJournalEntry,
  UpdateJournalEntry,
  BankAccount,
  CreateBankAccount,
  UpdateBankAccount,
  TrialBalance,
  ProfitLoss,
  BalanceSheet
} from '../models/financial.models';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private baseUrl = this.config.apiUrl + '/financial';

  constructor(private http: HttpClient, private config: ConfigService) {}

  // Accounts
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`);
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${id}`);
  }

  createAccount(body: CreateAccount): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, body);
  }

  updateAccount(id: number, body: UpdateAccount): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/accounts/${id}`, body);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/accounts/${id}`);
  }

  // Journal Entries
  getJournalEntries(): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(`${this.baseUrl}/journal-entries`);
  }

  getJournalEntry(id: number): Observable<JournalEntry> {
    return this.http.get<JournalEntry>(`${this.baseUrl}/journal-entries/${id}`);
  }

  createJournalEntry(body: CreateJournalEntry): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(`${this.baseUrl}/journal-entries`, body);
  }

  updateJournalEntry(id: number, body: UpdateJournalEntry): Observable<JournalEntry> {
    return this.http.put<JournalEntry>(`${this.baseUrl}/journal-entries/${id}`, body);
  }

  deleteJournalEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/journal-entries/${id}`);
  }

  postJournalEntry(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/journal-entries/${id}/post`, {});
  }

  reverseJournalEntry(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/journal-entries/${id}/reverse`, {});
  }

  // Bank Accounts
  getBankAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.baseUrl}/bank-accounts`);
  }

  getBankAccount(id: number): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.baseUrl}/bank-accounts/${id}`);
  }

  createBankAccount(body: CreateBankAccount): Observable<BankAccount> {
    return this.http.post<BankAccount>(`${this.baseUrl}/bank-accounts`, body);
  }

  updateBankAccount(id: number, body: UpdateBankAccount): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.baseUrl}/bank-accounts/${id}`, body);
  }

  deleteBankAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bank-accounts/${id}`);
  }

  // Reports
  getTrialBalance(asOf?: string): Observable<TrialBalance[]> {
    const qs = asOf ? `?asOfDate=${encodeURIComponent(asOf)}` : '';
    return this.http.get<TrialBalance[]>(`${this.baseUrl}/reports/trial-balance${qs}`);
  }

  getProfitLoss(start?: string, end?: string): Observable<ProfitLoss[]> {
    const params: string[] = [];
    if (start) params.push(`startDate=${encodeURIComponent(start)}`);
    if (end) params.push(`endDate=${encodeURIComponent(end)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this.http.get<ProfitLoss[]>(`${this.baseUrl}/reports/profit-loss${qs}`);
  }

  getBalanceSheet(asOf?: string): Observable<BalanceSheet[]> {
    const qs = asOf ? `?asOfDate=${encodeURIComponent(asOf)}` : '';
    return this.http.get<BalanceSheet[]>(`${this.baseUrl}/reports/balance-sheet${qs}`);
  }
}


