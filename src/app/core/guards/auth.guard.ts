import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loginUrl = () => router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  if (!authService.getToken()) return loginUrl();
  return authService.getCurrentUser().pipe(
    map(() => true),
    catchError(() => { authService.logout(); return of(loginUrl()); })
  );
};
