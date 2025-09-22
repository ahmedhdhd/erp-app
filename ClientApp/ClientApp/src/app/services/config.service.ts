import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  constructor() {}

  get apiUrl(): string {
    return environment.apiUrl;
  }

  get appName(): string {
    return environment.appName;
  }

  get version(): string {
    return environment.version;
  }

  get isProduction(): boolean {
    return environment.production;
  }

  // API endpoint builders
  getAuthApiUrl(): string {
    return `${this.apiUrl}/auth`;
  }

  getEmployeeApiUrl(): string {
    return `${this.apiUrl}/employee`;
  }

  getProductApiUrl(): string {
    return `${this.apiUrl}/product`;
  }

  getCategoryApiUrl(): string {
    return `${this.apiUrl}/category`;
  }

  getStockApiUrl(): string {
    return `${this.apiUrl}/stock`;
  }

  getVariantApiUrl(): string {
    return `${this.apiUrl}/variant`;
  }
}