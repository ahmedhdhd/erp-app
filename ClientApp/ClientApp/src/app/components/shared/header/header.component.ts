import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserInfo } from '../../../models/auth.models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: UserInfo | null = null;
  isAuthenticated = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isAuthenticated = state.isAuthenticated;
        this.currentUser = state.user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if server logout fails, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return `${this.currentUser.prenomEmploye} ${this.currentUser.nomEmploye}`;
    }
    return '';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }
}