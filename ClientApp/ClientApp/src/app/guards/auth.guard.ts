import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild,
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(childRoute, state);
  }

  private checkAuth(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Store the attempted URL for redirecting after login
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        // Check role-based access if required
        const requiredRoles = route.data['roles'] as string[];
        if (requiredRoles && requiredRoles.length > 0) {
          const currentUser = this.authService.getCurrentUser();
          if (!currentUser || !requiredRoles.includes(currentUser.role)) {
            // User doesn't have required role
            console.warn('Access denied: insufficient permissions');
            this.router.navigate(['/dashboard']); // Redirect to dashboard or show access denied page
            return false;
          }
        }

        return true;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        if (!this.authService.isAdmin()) {
          console.warn('Access denied: Admin role required');
          this.router.navigate(['/dashboard']);
          return false;
        }

        return true;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // User is already authenticated, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}