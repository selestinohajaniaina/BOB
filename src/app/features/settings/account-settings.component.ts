import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';

@Component({ selector: 'app-account-settings', standalone: true, imports: [DatePipe], templateUrl: './account-settings.component.html' })
export class AccountSettingsComponent {
  private readonly authService = inject(AuthService); private readonly router = inject(Router);
  user: User | null = null; isLoading = true; error = '';
  constructor() { this.authService.getCurrentUser().pipe(finalize(() => this.isLoading = false)).subscribe({ next: ({ user }) => this.user = user, error: (error: HttpErrorResponse) => this.error = error.status === 0 ? 'Impossible de joindre le serveur.' : error.error?.message || 'Impossible de charger le compte.' }); }
  logout(): void { this.authService.logout(); void this.router.navigateByUrl('/login'); }
}
