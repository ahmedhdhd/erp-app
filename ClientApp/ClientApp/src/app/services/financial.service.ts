import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  TransactionCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  FinancialReport,
  CreateFinancialReportRequest,
  UpdateFinancialReportRequest,
  ClientApiResponse
} from '../models/financial.models';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private baseUrl = 'api';

  constructor(private http: HttpClient) { }

  // Transaction methods
  getAllTransactions(page: number = 1, pageSize: number = 50): Observable<ClientApiResponse<Transaction[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
    return this.http.get<ClientApiResponse<Transaction[]>>(`${this.baseUrl}/transaction`, { params });
  }

  getTransactionById(id: number): Observable<ClientApiResponse<Transaction>> {
    return this.http.get<ClientApiResponse<Transaction>>(`${this.baseUrl}/transaction/${id}`);
  }

  createTransaction(request: CreateTransactionRequest): Observable<ClientApiResponse<Transaction>> {
    return this.http.post<ClientApiResponse<Transaction>>(`${this.baseUrl}/transaction`, request);
  }

  updateTransaction(id: number, request: UpdateTransactionRequest): Observable<ClientApiResponse<Transaction>> {
    return this.http.put<ClientApiResponse<Transaction>>(`${this.baseUrl}/transaction/${id}`, request);
  }

  deleteTransaction(id: number): Observable<ClientApiResponse<boolean>> {
    return this.http.delete<ClientApiResponse<boolean>>(`${this.baseUrl}/transaction/${id}`);
  }

  // Category methods
  getAllCategories(): Observable<ClientApiResponse<TransactionCategory[]>> {
    return this.http.get<ClientApiResponse<TransactionCategory[]>>(`${this.baseUrl}/transactioncategory`);
  }

  getCategoryById(id: number): Observable<ClientApiResponse<TransactionCategory>> {
    return this.http.get<ClientApiResponse<TransactionCategory>>(`${this.baseUrl}/transactioncategory/${id}`);
  }

  createCategory(request: CreateCategoryRequest): Observable<ClientApiResponse<TransactionCategory>> {
    return this.http.post<ClientApiResponse<TransactionCategory>>(`${this.baseUrl}/transactioncategory`, request);
  }

  updateCategory(id: number, request: UpdateCategoryRequest): Observable<ClientApiResponse<TransactionCategory>> {
    return this.http.put<ClientApiResponse<TransactionCategory>>(`${this.baseUrl}/transactioncategory/${id}`, request);
  }

  deleteCategory(id: number): Observable<ClientApiResponse<boolean>> {
    return this.http.delete<ClientApiResponse<boolean>>(`${this.baseUrl}/transactioncategory/${id}`);
  }

  // Budget methods
  getAllBudgets(): Observable<ClientApiResponse<Budget[]>> {
    return this.http.get<ClientApiResponse<Budget[]>>(`${this.baseUrl}/budget`);
  }

  getBudgetById(id: number): Observable<ClientApiResponse<Budget>> {
    return this.http.get<ClientApiResponse<Budget>>(`${this.baseUrl}/budget/${id}`);
  }

  createBudget(request: CreateBudgetRequest): Observable<ClientApiResponse<Budget>> {
    return this.http.post<ClientApiResponse<Budget>>(`${this.baseUrl}/budget`, request);
  }

  updateBudget(id: number, request: UpdateBudgetRequest): Observable<ClientApiResponse<Budget>> {
    return this.http.put<ClientApiResponse<Budget>>(`${this.baseUrl}/budget/${id}`, request);
  }

  deleteBudget(id: number): Observable<ClientApiResponse<boolean>> {
    return this.http.delete<ClientApiResponse<boolean>>(`${this.baseUrl}/budget/${id}`);
  }

  // Report methods
  getAllReports(): Observable<ClientApiResponse<FinancialReport[]>> {
    return this.http.get<ClientApiResponse<FinancialReport[]>>(`${this.baseUrl}/financialreport`);
  }

  getReportById(id: number): Observable<ClientApiResponse<FinancialReport>> {
    return this.http.get<ClientApiResponse<FinancialReport>>(`${this.baseUrl}/financialreport/${id}`);
  }

  createReport(request: CreateFinancialReportRequest): Observable<ClientApiResponse<FinancialReport>> {
    return this.http.post<ClientApiResponse<FinancialReport>>(`${this.baseUrl}/financialreport`, request);
  }

  updateReport(id: number, request: UpdateFinancialReportRequest): Observable<ClientApiResponse<FinancialReport>> {
    return this.http.put<ClientApiResponse<FinancialReport>>(`${this.baseUrl}/financialreport/${id}`, request);
  }

  deleteReport(id: number): Observable<ClientApiResponse<boolean>> {
    return this.http.delete<ClientApiResponse<boolean>>(`${this.baseUrl}/financialreport/${id}`);
  }
}