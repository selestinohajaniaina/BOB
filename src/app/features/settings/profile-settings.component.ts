import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';

@Component({ selector: 'app-profile-settings', standalone: true, imports: [ReactiveFormsModule], templateUrl: './profile-settings.component.html' })
export class ProfileSettingsComponent {
  private readonly authService = inject(AuthService);
  user: User | null = null;
  isLoading = true;
  isSaving = false;
  error = '';
  success = '';
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(255)] })
  });

  constructor() { this.loadProfile(); }

  get initials(): string {
    return (this.user?.name || 'BO').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  loadProfile(): void {
    this.isLoading = true; this.error = '';
    this.authService.getCurrentUser().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: ({ user }) => { this.user = user; this.form.reset({ name: user.name, email: user.email }); },
      error: (error: HttpErrorResponse) => this.error = this.message(error, 'Impossible de charger le profil.')
    });
  }

  save(): void {
    this.error = ''; this.success = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true; this.form.disable();
    const value = this.form.getRawValue();
    this.authService.updateProfile({ name: value.name.trim(), email: value.email.trim().toLowerCase() }).pipe(
      finalize(() => { this.isSaving = false; this.form.enable(); })
    ).subscribe({
      next: ({ user, message }) => { this.user = user; this.form.reset({ name: user.name, email: user.email }); this.success = message; },
      error: (error: HttpErrorResponse) => this.error = this.message(error, 'Impossible de mettre à jour le profil.')
    });
  }

  private message(error: HttpErrorResponse, fallback: string): string { return error.status === 0 ? 'Impossible de joindre le serveur.' : error.error?.message || fallback; }
}
