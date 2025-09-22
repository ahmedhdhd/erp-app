import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeStatsResponse, DepartmentResponse, PositionResponse } from '../../../models/employee.models';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-employee-stats',
  templateUrl: './employee-stats.component.html',
  styleUrls: ['./employee-stats.component.css']
})
export class EmployeeStatsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Expose Object to template
  Object = Object;
  
  stats: EmployeeStatsResponse | null = null;
  departments: DepartmentResponse[] = [];
  positions: PositionResponse[] = [];
  
  isLoading = false;
  errorMessage = '';
  
  // Chart data for visualization
  departmentChartData: any[] = [];
  statusChartData: any[] = [];
  
  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !['Admin', 'HR', 'Manager'].includes(currentUser.role)) {
      this.errorMessage = 'Access denied. Insufficient permissions to view statistics.';
      return;
    }
  }

  private loadStatistics(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Load main statistics
    this.employeeService.getEmployeeStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stats = response.data;
            this.prepareDepartmentChartData();
            this.prepareStatusChartData();
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load employee statistics';
          console.error('Error loading stats:', error);
          this.isLoading = false;
        }
      });

    // Load department statistics
    this.employeeService.getDepartmentStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.departments = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading department stats:', error);
        }
      });

    // Load position statistics
    this.employeeService.getPositionStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.positions = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading position stats:', error);
        }
      });
  }

  private prepareDepartmentChartData(): void {
    if (!this.stats?.employeesByDepartment) return;
    
    this.departmentChartData = Object.entries(this.stats.employeesByDepartment)
      .map(([department, count]) => ({
        name: department,
        value: count,
        percentage: ((count / this.stats!.totalEmployees) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  }

  private prepareStatusChartData(): void {
    if (!this.stats?.employeesByStatus) return;
    
    this.statusChartData = Object.entries(this.stats.employeesByStatus)
      .map(([status, count]) => ({
        name: status,
        value: count,
        percentage: ((count / this.stats!.totalEmployees) * 100).toFixed(1),
        color: this.getStatusColor(status)
      }));
  }

  private getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Active': '#198754',
      'Inactive': '#6c757d',
      'On Leave': '#ffc107',
      'Terminated': '#dc3545'
    };
    return colors[status] || '#6c757d';
  }

  getEmployeeGrowthPercentage(): number {
    if (!this.stats || this.stats.totalEmployees === 0) return 0;
    
    const currentMonthNew = this.stats.newEmployeesThisMonth;
    const previousMonthTotal = this.stats.totalEmployees - currentMonthNew;
    
    if (previousMonthTotal === 0) return 100;
    
    return (currentMonthNew / previousMonthTotal) * 100;
  }

  getActiveEmployeePercentage(): number {
    if (!this.stats || this.stats.totalEmployees === 0) return 0;
    return (this.stats.activeEmployees / this.stats.totalEmployees) * 100;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  getDepartmentPercentage(count: number): number {
    if (!this.stats || this.stats.totalEmployees === 0) return 0;
    return (count / this.stats.totalEmployees) * 100;
  }

  getTopDepartments(limit: number = 5): DepartmentResponse[] {
    return this.departments
      .sort((a, b) => b.employeeCount - a.employeeCount)
      .slice(0, limit);
  }

  getTopPositions(limit: number = 5): PositionResponse[] {
    return this.positions
      .sort((a, b) => b.employeeCount - a.employeeCount)
      .slice(0, limit);
  }

  onRefresh(): void {
    this.loadStatistics();
  }

  clearError(): void {
    this.errorMessage = '';
  }
}