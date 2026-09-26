import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    })
  });

  isLoading = false;
  loginError = '';

  get email(): FormControl<string> {
    return this.loginForm.controls.email;
  }

  get password(): FormControl<string> {
    return this.loginForm.controls.password;
  }

  submit(): void {
    this.loginError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginForm.disable();

    this.authService.login(this.loginForm.getRawValue())
      .pipe(finalize(() => {
        this.isLoading = false;
        this.loginForm.enable();
      }))
      .subscribe({
        next: () => {
          const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/dashboard';
          void this.router.navigateByUrl(redirect.startsWith('/') ? redirect : '/dashboard');
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 0) {
            this.loginError = 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';
          } else if (error.status === 401) {
            this.loginError = 'Email ou mot de passe incorrect.';
          } else {
            this.loginError = error.error?.message || 'Une erreur est survenue pendant la connexion.';
          }
        }
      });
  }
}
