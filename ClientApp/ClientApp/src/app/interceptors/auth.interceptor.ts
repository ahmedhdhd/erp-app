import { Injectable } from '@angular/core';
import { 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpInterceptor,
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from the service
    const authToken = this.authService.getToken();

    // Clone the request and add the authorization header if token exists
    if (authToken && !request.headers.has('Authorization')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    // Handle the request and catch any HTTP errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          // Check if the error indicates token expiration
          if (error.headers.get('Token-Expired') === 'true') {
            console.warn('Token expired, logging out user');
          }
          
          // Force logout and redirect to login
          this.authService.forceLogout();
          this.router.navigate(['/auth/login']);
        }

        // Handle 403 Forbidden errors
        if (error.status === 403) {
          console.warn('Access forbidden - insufficient permissions');
          // Optionally redirect to an access denied page
          // this.router.navigate(['/access-denied']);
        }

        // Pass the error along
        return throwError(error);
      })
    );
  }
}