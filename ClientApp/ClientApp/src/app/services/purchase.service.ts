import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import {
  CreatePurchaseRequestRequest,
  UpdatePurchaseRequestRequest,
  PurchaseRequestSearchRequest,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  SubmitPurchaseOrderRequest,
  CreateGoodsReceiptRequest,
  CreatePurchaseInvoiceRequest,
  PurchaseRequestResponse,
  PurchaseRequestListResponse,
  PurchaseOrderResponse,
  PurchaseOrderListResponse,
  PurchaseOrderSearchRequest,
  PurchaseApiResponse
} from '../models/purchase.models';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.apiUrl;
  }

  // ========== PURCHASE REQUESTS ==========

  createPurchaseRequest(request: CreatePurchaseRequestRequest): Observable<PurchaseApiResponse<PurchaseRequestResponse>> {
    return this.http.post<PurchaseApiResponse<PurchaseRequestResponse>>(
      `${this.baseUrl}/demandeachat`,
      request
    );
  }

  getPurchaseRequest(id: number): Observable<PurchaseApiResponse<PurchaseRequestResponse>> {
    return this.http.get<PurchaseApiResponse<PurchaseRequestResponse>>(
      `${this.baseUrl}/demandeachat/${id}`
    );
  }

  getAllPurchaseRequests(searchRequest: PurchaseRequestSearchRequest): Observable<PurchaseApiResponse<PurchaseRequestListResponse>> {
    let params = new HttpParams()
      .set('page', searchRequest.page.toString())
      .set('pageSize', searchRequest.pageSize.toString());

    if (searchRequest.searchTerm) {
      params = params.set('searchTerm', searchRequest.searchTerm);
    }
    if (searchRequest.employeId) {
      params = params.set('employeId', searchRequest.employeId.toString());
    }
    if (searchRequest.statut) {
      params = params.set('statut', searchRequest.statut);
    }
    if (searchRequest.dateMin) {
      params = params.set('dateMin', searchRequest.dateMin.toISOString());
    }
    if (searchRequest.dateMax) {
      params = params.set('dateMax', searchRequest.dateMax.toISOString());
    }
    if (searchRequest.sortBy) {
      params = params.set('sortBy', searchRequest.sortBy);
    }
    if (searchRequest.sortDirection) {
      params = params.set('sortDirection', searchRequest.sortDirection);
    }

    return this.http.get<PurchaseApiResponse<PurchaseRequestListResponse>>(
      `${this.baseUrl}/demandeachat`,
      { params }
    );
  }

  updatePurchaseRequest(id: number, request: UpdatePurchaseRequestRequest): Observable<PurchaseApiResponse<PurchaseRequestResponse>> {
    return this.http.put<PurchaseApiResponse<PurchaseRequestResponse>>(
      `${this.baseUrl}/demandeachat/${id}`,
      request
    );
  }

  deletePurchaseRequest(id: number): Observable<PurchaseApiResponse<void>> {
    return this.http.delete<PurchaseApiResponse<void>>(
      `${this.baseUrl}/demandeachat/${id}`
    );
  }

  submitPurchaseRequest(id: number): Observable<PurchaseApiResponse<PurchaseRequestResponse>> {
    return this.http.post<PurchaseApiResponse<PurchaseRequestResponse>>(
      `${this.baseUrl}/demandeachat/${id}/submit`,
      {}
    );
  }

  // ========== PURCHASE ORDERS ==========

  createPurchaseOrder(request: CreatePurchaseOrderRequest): Observable<PurchaseApiResponse<PurchaseOrderResponse>> {
    return this.http.post<PurchaseApiResponse<PurchaseOrderResponse>>(
      `${this.baseUrl}/commandeachat`,
      request
    );
  }

  getPurchaseOrder(id: number): Observable<PurchaseApiResponse<PurchaseOrderResponse>> {
    return this.http.get<PurchaseApiResponse<PurchaseOrderResponse>>(
      `${this.baseUrl}/commandeachat/${id}`
    );
  }

  getAllPurchaseOrders(page: number, pageSize: number): Observable<PurchaseApiResponse<PurchaseOrderListResponse>> {
    // Ensure page and pageSize are valid numbers
    const validPage = Math.max(1, Number(page) || 1);
    const validPageSize = Math.max(1, Number(pageSize) || 10);
    
    const params = new HttpParams()
      .set('page', validPage.toString())
      .set('pageSize', validPageSize.toString());

    return this.http.get<PurchaseApiResponse<PurchaseOrderListResponse>>(
      `${this.baseUrl}/commandeachat`,
      { params }
    );
  }

  searchPurchaseOrders(request: PurchaseOrderSearchRequest): Observable<PurchaseApiResponse<PurchaseOrderListResponse>> {
    return this.http.post<PurchaseApiResponse<PurchaseOrderListResponse>>(
      `${this.baseUrl}/commandeachat/search`,
      request
    );
  }

  updatePurchaseOrder(id: number, request: UpdatePurchaseOrderRequest): Observable<PurchaseApiResponse<PurchaseOrderResponse>> {
    return this.http.put<PurchaseApiResponse<PurchaseOrderResponse>>(
      `${this.baseUrl}/commandeachat/${id}`,
      request
    );
  }

  deletePurchaseOrder(id: number): Observable<PurchaseApiResponse<void>> {
    return this.http.delete<PurchaseApiResponse<void>>(
      `${this.baseUrl}/commandeachat/${id}`
    );
  }

  submitPurchaseOrder(request: SubmitPurchaseOrderRequest): Observable<PurchaseApiResponse<PurchaseOrderResponse>> {
    return this.http.post<PurchaseApiResponse<PurchaseOrderResponse>>(
      `${this.baseUrl}/commandeachat/${request.commandeId}/submit`,
      {}
    );
  }

  receiveGoods(request: CreateGoodsReceiptRequest): Observable<PurchaseApiResponse<any>> {
    return this.http.post<PurchaseApiResponse<any>>(
      `${this.baseUrl}/commandeachat/${request.commandeId}/receive`,
      request
    );
  }

  createInvoice(request: CreatePurchaseInvoiceRequest): Observable<PurchaseApiResponse<any>> {
    return this.http.post<PurchaseApiResponse<any>>(
      `${this.baseUrl}/commandeachat/${request.commandeId}/invoice`,
      request
    );
  }
}