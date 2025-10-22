import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
  private baseUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = this.config.apiUrl;
  }

  getFournisseurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fournisseur`);
  }

  getFournisseur(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/fournisseur/${id}`);
  }

  createFournisseur(fournisseur: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/fournisseur`, fournisseur);
  }

  updateFournisseur(id: number, fournisseur: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/fournisseur/${id}`, fournisseur);
  }

  deleteFournisseur(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/fournisseur/${id}`);
  }
}
