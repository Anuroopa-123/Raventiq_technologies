import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthUser, LoginPayload, RegisterPayload, TokenResponse } from './models';

const TOKEN_KEY = 'raventiq_token';
const USER_KEY = 'raventiq_user';

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  /** null = logged out. Restored synchronously from localStorage so a page
   * refresh on /admin doesn't flash a logged-out state before redirecting. */
  user = signal<AuthUser | null>(readStoredUser());
  token = signal<string | null>(this.readToken());

  isLoggedIn = computed(() => this.user() !== null);
  isAdmin = computed(() => this.user()?.role === 'admin' || this.user()?.role === 'superadmin');
  isSuperadmin = computed(() => this.user()?.role === 'superadmin');

  private readToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private setSession(r: TokenResponse) {
    try {
      localStorage.setItem(TOKEN_KEY, r.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    } catch {
      /* private browsing / storage blocked: session still works for this tab */
    }
    this.token.set(r.access_token);
    this.user.set(r.user);
  }

  register(payload: RegisterPayload): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/register', payload).pipe(tap((r) => this.setSession(r)));
  }

  login(payload: LoginPayload): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/login', payload).pipe(tap((r) => this.setSession(r)));
  }

  loginWithGoogle(credential: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/google', { credential }).pipe(tap((r) => this.setSession(r)));
  }

  /** Called by the auth interceptor when a token turns out to be invalid/expired. */
  clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    this.token.set(null);
    this.user.set(null);
  }

  logout() {
    this.clearSession();
  }
}
