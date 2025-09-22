import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { 
  ClientStatsResponse,
  ClientApiResponse
} from '../../../models/client.models';
import { ClientService } from '../../../services/client.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-client-statistics',
  templateUrl: './client-statistics.component.html',
  styleUrls: ['./client-statistics.component.css']
})
export class ClientStatisticsComponent implements OnInit, OnDestroy {
  stats: ClientStatsResponse | null = null;
  loading = false;
  errorMessage = '';
  
  // Chart data
  clientTypesData: { name: string, value: number }[] = [];
  clientClassificationsData: { name: string, value: number }[] = [];
  clientCitiesData: { name: string, value: number }[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== DATA LOADING ====================

  private loadStatistics(): void {
    this.loading = true;
    this.clientService.getClientStats().subscribe({
      next: (response: ClientApiResponse<ClientStatsResponse>) => {
        this.loading = false;
        if (response.success && response.data) {
          this.stats = response.data;
          this.prepareChartData();
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des statistiques';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error.message || 'Erreur lors du chargement des statistiques';
        console.error('Error loading client stats:', error);
      }
    });
  }

  private prepareChartData(): void {
    if (!this.stats) return;
    
    // Prepare client types data
    this.clientTypesData = Object.keys(this.stats.clientsByType).map(key => ({
      name: key,
      value: this.stats!.clientsByType[key]
    }));
    
    // Prepare client classifications data
    this.clientClassificationsData = Object.keys(this.stats.clientsByClassification).map(key => ({
      name: key,
      value: this.stats!.clientsByClassification[key]
    }));
    
    // Prepare client cities data (top 10)
    const citiesEntries = Object.entries(this.stats.clientsByCity);
    citiesEntries.sort((a, b) => b[1] - a[1]); // Sort by value descending
    this.clientCitiesData = citiesEntries.slice(0, 10).map(([key, value]) => ({
      name: key,
      value: value
    }));
  }

  // ==================== UTILITY METHODS ====================

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return permission.split(',').some(role => this.authService.hasRole(role.trim()));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(value);
  }

  refreshStats(): void {
    this.loadStatistics();
  }
}