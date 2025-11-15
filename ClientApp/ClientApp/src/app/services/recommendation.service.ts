import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductResponse } from '../models/product.models';

export interface RecommendationResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) { }

  getRecommendations(count: number = 10): Observable<RecommendationResponse<ProductResponse[]>> {
    return this.http.get<RecommendationResponse<ProductResponse[]>>(`${this.apiUrl}?count=${count}`);
  }
}