import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User { id: number; name: string; email: string; }
export interface LoginCredentials { email: string; password: string; }
export interface RegisterData { name: string; email: string; password: string; }
export interface LoginResponse { message: string; token: string; user: User; }
export interface RegisterResponse { message: string; user: User; }
export interface CurrentUserResponse { user: User; }
export interface ApiError { message: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'bob_auth_token';
  private readonly userKey = 'bob_auth_user';
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap((response) => this.saveSession(response.token, response.user))
    );
  }

  register(data: RegisterData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.authUrl}/register`, data);
  }

  getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${this.authUrl}/me`).pipe(
      tap(({ user }) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  private saveSession(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readStoredUser(): User | null {
    try {
      const storedUser = localStorage.getItem(this.userKey);
      return storedUser ? JSON.parse(storedUser) as User : null;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
