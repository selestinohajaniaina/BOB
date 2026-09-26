import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('registers through the backend API', () => {
    const data = { name: 'Ada', email: 'ada@example.com', password: 'password123' };
    service.register(data).subscribe((response) => expect(response.user.email).toBe(data.email));
    const request = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);
    request.flush({ message: 'Compte créé avec succès', user: { id: 1, name: 'Ada', email: data.email } });
  });

  it('stores the token and public user after login', () => {
    service.login({ email: 'ada@example.com', password: 'password123' }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/auth/login`);
    request.flush({ message: 'Connexion réussie', token: 'jwt-token', user: { id: 1, name: 'Ada', email: 'ada@example.com' } });
    expect(localStorage.getItem('bob_auth_token')).toBe('jwt-token');
    expect(service.getToken()).toBe('jwt-token');
  });

  it('clears the session on logout', () => {
    localStorage.setItem('bob_auth_token', 'jwt-token');
    localStorage.setItem('bob_auth_user', '{}');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('bob_auth_user')).toBeNull();
  });

  it('updates the profile and the locally exposed user', () => {
    const user = { id: 1, name: 'Ada Lovelace', email: 'ada@bob.local' };
    service.updateProfile({ name: user.name, email: user.email }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/auth/me`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ message: 'Profil mis à jour avec succès', user });
    expect(JSON.parse(localStorage.getItem('bob_auth_user') || '{}').name).toBe(user.name);
  });

  it('changes the password through the protected API', () => {
    const data = { currentPassword: 'password123', newPassword: 'new-password123', confirmPassword: 'new-password123' };
    service.changePassword(data).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/auth/me/password`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(data);
    request.flush({ message: 'Mot de passe modifié avec succès' });
  });
});
