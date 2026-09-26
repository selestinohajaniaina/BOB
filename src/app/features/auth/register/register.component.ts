import { Component, inject } from '@angular/core';
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
      .subscribe((result) => {
        if (!result.success) {
          return;
        }

        this.registrationSuccess = true;
        timer(1000).subscribe(() => void this.router.navigateByUrl('/login'));
      });
  }
}
