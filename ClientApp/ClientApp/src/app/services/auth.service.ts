import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ChangePasswordRequest, 
  ResetPasswordRequest,
  UserInfo, 
  UserProfile, 
  Employee,
  AuthState,
  ApiError,
  EmployeeApiResponse
} from '../models/auth.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`; // Use environment API URL
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly EXPIRATION_KEY = 'auth_expiration';

  // BehaviorSubject to track authentication state
  private authStateSubject = new BehaviorSubject<AuthState>(this.getInitialAuthState());
  public authState$ = this.authStateSubject.asObservable();

  // Convenience observables
  public isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  public currentUser$ = this.authState$.pipe(map(state => state.user));

  constructor(private http: HttpClient) {
    this.checkTokenExpiration();
  }

  // ========== AUTHENTICATION METHODS ==========

  /**
   * User login
   */
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    console.log('Attempting login with request:', loginRequest);
    console.log('API URL:', this.apiUrl);
    console.log('Full login URL:', `${this.apiUrl}/login`);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response.success && response.token && response.userInfo) {
            this.setAuthData(response.token, response.userInfo, response.expiration);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * User registration (Admin only)
   */
  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Change password
   */
  changePassword(changePasswordRequest: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/change-password`, changePasswordRequest, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Reset password (Admin only)
   */
  resetPassword(resetPasswordRequest: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, resetPasswordRequest, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.clearAuthData()),
      catchError(error => {
        // Even if logout fails on server, clear local data
        this.clearAuthData();
        return throwError(error);
      })
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get all users (Admin only)
   */
  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get available employees for registration
   */
  getAvailableEmployees(): Observable<Employee[]> {
    return this.http.get<EmployeeApiResponse<Employee[]>>(`${this.apiUrl}/available-employees`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  /**
   * Check username availability
   */
  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username/${encodeURIComponent(username)}`)
      .pipe(catchError(this.handleError));
  }

  // ========== TOKEN MANAGEMENT ==========

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current user info
   */
  getCurrentUser(): UserInfo | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiration = this.getTokenExpiration();
    
    if (!token || !expiration) {
      return false;
    }

    return new Date() < new Date(expiration);
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  /**
   * Force logout (clear local data)
   */
  forceLogout(): void {
    this.clearAuthData();
  }

  // ========== PRIVATE METHODS ==========

  private setAuthData(token: string, user: UserInfo, expiration?: Date): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    if (expiration) {
      localStorage.setItem(this.EXPIRATION_KEY, expiration.toString());
    }

    // Update auth state
    this.authStateSubject.next({
      isAuthenticated: true,
      token: token,
      user: user,
      tokenExpiration: expiration || null
    });
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRATION_KEY);

    // Update auth state
    this.authStateSubject.next({
      isAuthenticated: false,
      token: null,
      user: null,
      tokenExpiration: null
    });
  }

  private getTokenExpiration(): string | null {
    return localStorage.getItem(this.EXPIRATION_KEY);
  }

  private getInitialAuthState(): AuthState {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const expiration = this.getTokenExpiration();
    const isAuthenticated = this.isAuthenticated();

    return {
      isAuthenticated,
      token,
      user,
      tokenExpiration: expiration ? new Date(expiration) : null
    };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private checkTokenExpiration(): void {
    // Check token expiration every minute
    setInterval(() => {
      if (!this.isAuthenticated() && this.authStateSubject.value.isAuthenticated) {
        this.forceLogout();
      }
    }, 60000); // 60 seconds
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let apiError: ApiError;

    console.log('Auth Service Error Details:', {
      error: error,
      status: error.status,
      message: error.message,
      errorObject: error.error,
      headers: error.headers,
      url: error.url
    });

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      apiError = {
        message: error.error.message,
        status: 0,
        error: error.error
      };
    } else {
      // Server-side error
      apiError = {
        message: error.error?.message || error.message || 'Une erreur est survenue',
        status: error.status,
        error: error.error
      };

      // If unauthorized, clear auth data
      if (error.status === 401) {
        this.forceLogout();
      }
    }

    console.error('Auth Service Error:', apiError);
    return throwError(apiError);
  };
}