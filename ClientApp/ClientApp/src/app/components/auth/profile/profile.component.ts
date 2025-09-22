import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserProfile, UserInfo } from '../../../models/auth.models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: UserInfo | null = null;
  userProfile: UserProfile | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Get current user from auth service
    this.currentUser = this.authService.getCurrentUser();

    // Load detailed profile
    this.authService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userProfile = profile;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement du profil';
        console.error('Error loading profile:', error);
        this.isLoading = false;
      }
    });
  }

  onChangePassword(): void {
    this.router.navigate(['/auth/change-password']);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        // Force logout even if server request fails
        this.authService.forceLogout();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  onEditProfile(): void {
    // Navigate to edit profile page (to be implemented)
    console.log('Edit profile functionality to be implemented');
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'Admin': 'Administrateur',
      'Vendeur': 'Vendeur',
      'Acheteur': 'Acheteur',
      'Comptable': 'Comptable',
      'RH': 'Ressources Humaines'
    };
    return roleMap[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const roleClassMap: { [key: string]: string } = {
      'Admin': 'badge-admin',
      'Vendeur': 'badge-vendeur',
      'Acheteur': 'badge-acheteur',
      'Comptable': 'badge-comptable',
      'RH': 'badge-rh'
    };
    return roleClassMap[role] || 'badge-default';
  }

  getStatusDisplayName(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-danger';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(firstName: string, lastName: string): string {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onManageUsers(): void {
    this.router.navigate(['/admin/users']);
  }
}