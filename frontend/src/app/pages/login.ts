import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { GoogleSigninComponent } from '../shared/google-signin';
import { SITE } from '../site.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleSigninComponent],
  template: `
    <section class="auth-wrap">
      <div class="glass card">
        <span class="eyebrow">Welcome back</span>
        <h1>Log in to {{ s.short }}</h1>
        <p class="lead">Students, admins and the owner all sign in here.</p>

        <app-google-signin (credential)="onGoogle($event)" />
        <div class="or"><span>or with your email</span></div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label>Email
            <input formControlName="email" type="email" autocomplete="email" placeholder="you@example.com" />
          </label>
          <label>Password
            <input formControlName="password" type="password" autocomplete="current-password" placeholder="••••••••" />
          </label>
          @if (error()) { <p class="err box" role="alert">{{ error() }}</p> }
          <button class="btn primary" type="submit" [disabled]="busy()">{{ busy() ? 'Logging in…' : 'Log in' }}</button>
        </form>

        <p class="switch">New here? <a routerLink="/register">Create a student account</a></p>
      </div>
    </section>
  `,
  styleUrl: './auth.scss',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  s = SITE;
  busy = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  private goNext() {
    const next = this.route.snapshot.queryParamMap.get('next');
    const role = this.auth.user()?.role;
    if (next) this.router.navigateByUrl(next);
    else if (role === 'superadmin') this.router.navigateByUrl('/superadmin');
    else if (role === 'admin') this.router.navigateByUrl('/admin');
    else this.router.navigateByUrl('/');
  }

  submit() {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => { this.busy.set(false); this.goNext(); },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(e.status === 401 ? 'Incorrect email or password.' : 'Something went wrong. Please try again.');
      },
    });
  }

  onGoogle(credential: string) {
    this.error.set('');
    this.busy.set(true);
    this.auth.loginWithGoogle(credential).subscribe({
      next: () => { this.busy.set(false); this.goNext(); },
      error: () => { this.busy.set(false); this.error.set('Google sign-in failed. Please try again.'); },
    });
  }
}
