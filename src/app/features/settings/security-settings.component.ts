import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('newPassword')?.value === control.get('confirmPassword')?.value ? null : { passwordMismatch: true };
}

@Component({ selector: 'app-security-settings', standalone: true, imports: [ReactiveFormsModule], templateUrl: './security-settings.component.html' })
export class SecuritySettingsComponent {
  private readonly authService = inject(AuthService);
  isSaving = false; error = ''; success = '';
  readonly form = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  }, { validators: passwordsMatch });

  save(): void {
    this.error = ''; this.success = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true; this.form.disable();
    this.authService.changePassword(this.form.getRawValue()).pipe(finalize(() => { this.isSaving = false; this.form.enable(); })).subscribe({
      next: ({ message }) => { this.success = message; this.form.reset(); },
      error: (error: HttpErrorResponse) => this.error = error.status === 0 ? 'Impossible de joindre le serveur.' : error.error?.message || 'Impossible de modifier le mot de passe.'
    });
  }
}
