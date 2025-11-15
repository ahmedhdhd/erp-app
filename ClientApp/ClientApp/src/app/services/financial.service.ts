import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { CreateReglementRequest, UpdateReglementRequest, ReglementResponse, FinancialApiResponse, JournalSearchRequest, JournalListResponse } from '../models/financial.models';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private baseUrl: string;
  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = this.config.apiUrl;
  }

  // Reglement endpoints
  getReglementsByPurchaseOrder(commandeId: number): Observable<FinancialApiResponse<ReglementResponse[]>> {
    return this.http.get<FinancialApiResponse<ReglementResponse[]>>(`${this.baseUrl}/reglement/commande-achat/${commandeId}`);
  }

  getReglementsBySalesOrder(commandeId: number): Observable<FinancialApiResponse<ReglementResponse[]>> {
    return this.http.get<FinancialApiResponse<ReglementResponse[]>>(`${this.baseUrl}/reglement/commande-vente/${commandeId}`);
  }

  createReglement(payload: CreateReglementRequest): Observable<FinancialApiResponse<ReglementResponse>> {
    return this.http.post<FinancialApiResponse<ReglementResponse>>(`${this.baseUrl}/reglement`, payload);
  }

  updateReglement(id: number, payload: UpdateReglementRequest): Observable<FinancialApiResponse<ReglementResponse>> {
    return this.http.put<FinancialApiResponse<ReglementResponse>>(`${this.baseUrl}/reglement/${id}`, payload);
  }

  deleteReglement(id: number): Observable<FinancialApiResponse<boolean>> {
    return this.http.delete<FinancialApiResponse<boolean>>(`${this.baseUrl}/reglement/${id}`);
  }

  // Journal endpoints
  searchJournalEntries(filters: JournalSearchRequest): Observable<FinancialApiResponse<JournalListResponse>> {
    return this.http.post<FinancialApiResponse<JournalListResponse>>(`${this.baseUrl}/journal/search`, filters);
  }

  getSupplierJournal(supplierId: number, startDate?: string, endDate?: string, page: number = 1, pageSize: number = 20): Observable<FinancialApiResponse<JournalListResponse>> {
    let url = `${this.baseUrl}/journal/supplier/${supplierId}?page=${page}&pageSize=${pageSize}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return this.http.get<FinancialApiResponse<JournalListResponse>>(url);
  }

  getCustomerJournal(customerId: number, startDate?: string, endDate?: string, page: number = 1, pageSize: number = 20): Observable<FinancialApiResponse<JournalListResponse>> {
    let url = `${this.baseUrl}/journal/customer/${customerId}?page=${page}&pageSize=${pageSize}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return this.http.get<FinancialApiResponse<JournalListResponse>>(url);
  }
}


