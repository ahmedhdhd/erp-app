import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import {
  CreateQuoteRequest,
  UpdateQuoteRequest,
  QuoteSearchRequest,
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  SalesOrderSearchRequest,
  CreateDeliveryRequest,
  CreateInvoiceRequest,
  CreateReturnRequest,
  QuoteResponse,
  QuoteListResponse,
  SalesOrderResponse,
  SalesOrderListResponse,
  SalesApiResponse
} from '../models/sales.models';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.apiUrl;
  }

  // ========== SALES QUOTES ==========

  createQuote(request: CreateQuoteRequest): Observable<SalesApiResponse<QuoteResponse>> {
    return this.http.post<SalesApiResponse<QuoteResponse>>(
      `${this.baseUrl}/commandevente/devis`,
      request
    );
  }

  getQuote(id: number): Observable<SalesApiResponse<QuoteResponse>> {
    return this.http.get<SalesApiResponse<QuoteResponse>>(
      `${this.baseUrl}/commandevente/devis/${id}`
    );
  }

  getAllQuotes(page: number, pageSize: number): Observable<SalesApiResponse<QuoteListResponse>> {
    // Ensure page and pageSize are valid numbers
    const validPage = Math.max(1, Number(page) || 1);
    const validPageSize = Math.max(1, Number(pageSize) || 10);
    
    const params = new HttpParams()
      .set('page', validPage.toString())
      .set('pageSize', validPageSize.toString());

    return this.http.get<SalesApiResponse<QuoteListResponse>>(
      `${this.baseUrl}/commandevente/devis`,
      { params }
    );
  }

  searchQuotes(request: QuoteSearchRequest): Observable<SalesApiResponse<QuoteListResponse>> {
    return this.http.post<SalesApiResponse<QuoteListResponse>>(
      `${this.baseUrl}/commandevente/devis/search`,
      request
    );
  }

  updateQuote(id: number, request: UpdateQuoteRequest): Observable<SalesApiResponse<QuoteResponse>> {
    return this.http.put<SalesApiResponse<QuoteResponse>>(
      `${this.baseUrl}/commandevente/devis/${id}`,
      request
    );
  }

  deleteQuote(id: number): Observable<SalesApiResponse<void>> {
    return this.http.delete<SalesApiResponse<void>>(
      `${this.baseUrl}/commandevente/devis/${id}`
    );
  }

  submitQuote(id: number): Observable<SalesApiResponse<QuoteResponse>> {
    return this.http.post<SalesApiResponse<QuoteResponse>>(
      `${this.baseUrl}/commandevente/devis/${id}/submit`,
      {}
    );
  }

  acceptQuote(id: number): Observable<SalesApiResponse<QuoteResponse>> {
    return this.http.post<SalesApiResponse<QuoteResponse>>(
      `${this.baseUrl}/commandevente/devis/${id}/accept`,
      {}
    );
  }

  // ========== SALES ORDERS ==========

  createSalesOrder(request: CreateSalesOrderRequest): Observable<SalesApiResponse<SalesOrderResponse>> {
    return this.http.post<SalesApiResponse<SalesOrderResponse>>(
      `${this.baseUrl}/commandevente/commandes`,
      request
    );
  }

  getSalesOrder(id: number): Observable<SalesApiResponse<SalesOrderResponse>> {
    return this.http.get<SalesApiResponse<SalesOrderResponse>>(
      `${this.baseUrl}/commandevente/commandes/${id}`
    );
  }

  getAllSalesOrders(page: number, pageSize: number): Observable<SalesApiResponse<SalesOrderListResponse>> {
    // Ensure page and pageSize are valid numbers
    const validPage = Math.max(1, Number(page) || 1);
    const validPageSize = Math.max(1, Number(pageSize) || 10);
    
    const params = new HttpParams()
      .set('page', validPage.toString())
      .set('pageSize', validPageSize.toString());

    return this.http.get<SalesApiResponse<SalesOrderListResponse>>(
      `${this.baseUrl}/commandevente/commandes`,
      { params }
    );
  }

  searchSalesOrders(request: SalesOrderSearchRequest): Observable<SalesApiResponse<SalesOrderListResponse>> {
    return this.http.post<SalesApiResponse<SalesOrderListResponse>>(
      `${this.baseUrl}/commandevente/commandes/search`,
      request
    );
  }

  updateSalesOrder(id: number, request: UpdateSalesOrderRequest): Observable<SalesApiResponse<SalesOrderResponse>> {
    return this.http.put<SalesApiResponse<SalesOrderResponse>>(
      `${this.baseUrl}/commandevente/commandes/${id}`,
      request
    );
  }

  deleteSalesOrder(id: number): Observable<SalesApiResponse<void>> {
    return this.http.delete<SalesApiResponse<void>>(
      `${this.baseUrl}/commandevente/commandes/${id}`
    );
  }

  submitSalesOrder(id: number): Observable<SalesApiResponse<SalesOrderResponse>> {
    return this.http.post<SalesApiResponse<SalesOrderResponse>>(
      `${this.baseUrl}/commandevente/commandes/${id}/submit`,
      {}
    );
  }

  // ========== DELIVERIES ==========

  createDelivery(request: CreateDeliveryRequest): Observable<SalesApiResponse<any>> {
    return this.http.post<SalesApiResponse<any>>(
      `${this.baseUrl}/commandevente/livraisons`,
      request
    );
  }

  // ========== INVOICES ==========

  createInvoice(request: CreateInvoiceRequest): Observable<SalesApiResponse<any>> {
    return this.http.post<SalesApiResponse<any>>(
      `${this.baseUrl}/commandevente/factures`,
      request
    );
  }

  // ========== RETURNS ==========

  createReturn(request: CreateReturnRequest): Observable<SalesApiResponse<any>> {
    return this.http.post<SalesApiResponse<any>>(
      `${this.baseUrl}/commandevente/retours`,
      request
    );
  }
}