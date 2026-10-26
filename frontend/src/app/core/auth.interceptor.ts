import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Attaches the bearer token to our own API calls, and logs out automatically
 * if the server says the token is no longer valid (expired / account removed). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const isOurApi = req.url.startsWith('/api/');
  const authed = isOurApi && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err) => {
      if (isOurApi && token && err?.status === 401) auth.clearSession();
      return throwError(() => err);
    }),
  );
};
