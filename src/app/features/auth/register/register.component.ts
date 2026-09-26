import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timer } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value as string | undefined;
  const confirmationPassword = control.get('confirmationPassword')?.value as string | undefined;

  return password && confirmationPassword && password !== confirmationPassword
    ? { passwordsMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly registerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmationPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  }, { validators: passwordsMatchValidator });

  isLoading = false;
  registrationSuccess = false;
  registrationError = '';
  emailInUse = false;

  get name(): FormControl<string> {
    return this.registerForm.controls.name;
  }

  get email(): FormControl<string> {
    return this.registerForm.controls.email;
  }

  get password(): FormControl<string> {
    return this.registerForm.controls.password;
  }

  get confirmationPassword(): FormControl<string> {
    return this.registerForm.controls.confirmationPassword;
  }

  get confirmationMismatch(): boolean {
    return this.confirmationPassword.touched
      && this.registerForm.hasError('passwordsMismatch');
  }

  submit(): void {
    this.registrationSuccess = false;
    this.registrationError = '';
    this.emailInUse = false;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerForm.disable();
    const { name, email, password } = this.registerForm.getRawValue();

    this.authService.register({ name: name.trim(), email: email.trim(), password })
      .pipe(finalize(() => {
        this.isLoading = false;
        this.registerForm.enable();
      }))
      .subscribe({
        next: () => {
          this.registrationSuccess = true;
          timer(1200).subscribe(() => void this.router.navigateByUrl('/login'));
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.emailInUse = true;
            this.email.markAsTouched();
          } else if (error.status === 0) {
            this.registrationError = 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';
          } else {
            this.registrationError = error.error?.message || 'Une erreur est survenue pendant la création du compte.';
          }
        }
      });
  }
}
