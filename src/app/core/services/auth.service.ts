import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly demoCredentials: LoginCredentials = {
    email: 'demo@bob.local',
    password: 'password'
  };

  login(credentials: LoginCredentials): Observable<LoginResult> {
    const success = credentials.email.trim().toLowerCase() === this.demoCredentials.email
      && credentials.password === this.demoCredentials.password;

    return of({ success }).pipe(delay(700));
  }

  register(_data: RegisterData): Observable<RegisterResult> {
    return of({ success: true }).pipe(delay(700));
  }
}
