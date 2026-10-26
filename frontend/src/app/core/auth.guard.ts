import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

/** Blocks a route unless the signed-in user has one of `roles`.
 * Not logged in -> /login (remembers where they were headed).
 * Logged in but wrong role -> back to the homepage. */
export function roleGuard(...roles: Role[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();
    if (!user) return router.createUrlTree(['/login'], { queryParams: { next: state.url } });
    if (!roles.includes(user.role)) return router.createUrlTree(['/']);
    return true;
  };
}

/** Blocks /login and /register once already signed in, sending each role
 * somewhere sensible instead. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  if (!user) return true;
  if (user.role === 'superadmin') return router.createUrlTree(['/superadmin']);
  if (user.role === 'admin') return router.createUrlTree(['/admin']);
  return router.createUrlTree(['/']);
};
