import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserInfo } from '../../models/auth.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: UserInfo | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  canViewStats(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? ['Admin', 'RH', 'Manager'].includes(user.role) : false;
  }

  canManageEmployees(): boolean {
    const user = this.authService.getCurrentUser();
    return user ? ['Admin', 'RH', 'Manager'].includes(user.role) : false;
  }

  navigateToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  navigateToStats(): void {
    this.router.navigate(['/employees/statistics']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}