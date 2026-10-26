import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { GoogleSigninComponent } from '../shared/google-signin';
import { SITE } from '../site.config';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleSigninComponent],
  template: `
    <section class="auth-wrap">
      <div class="glass card">
        <span class="eyebrow">Join {{ s.short }}</span>
        <h1>Create your student account</h1>
        <p class="lead">For the free workshop, internships and project updates. Admin and owner accounts are created by the owner, not here.</p>

        <app-google-signin text="signup_with" (credential)="onGoogle($event)" />
        <div class="or"><span>or with your email</span></div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label>Full name
            <input formControlName="name" autocomplete="name" placeholder="Your full name" />
            @if (bad('name')) { <small class="err">Please enter your name (at least 2 letters).</small> }
          </label>
          <label>Email
            <input formControlName="email" type="email" autocomplete="email" placeholder="you@example.com" />
            @if (bad('email')) { <small class="err">Please enter a valid email address.</small> }
          </label>
          <div class="row">
            <label>Phone / WhatsApp
              <input formControlName="phone" type="tel" autocomplete="tel" placeholder="+91 ..." />
            </label>
            <label>College
              <input formControlName="college" autocomplete="organization" placeholder="Your college (optional)" />
            </label>
          </div>
          <label>Password
            <input formControlName="password" type="password" autocomplete="new-password" placeholder="At least 8 characters" />
            @if (bad('password')) { <small class="err">Password must be at least 8 characters.</small> }
          </label>
          @if (error()) { <p class="err box" role="alert">{{ error() }}</p> }
          <button class="btn primary" type="submit" [disabled]="busy()">{{ busy() ? 'Creating account…' : 'Create account' }}</button>
        </form>

        <p class="switch">Already registered? <a routerLink="/login">Log in</a></p>
      </div>
    </section>
  `,
  styleUrl: './auth.scss',
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  s = SITE;
  busy = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    college: [''],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
  });

  bad(c: 'name' | 'email' | 'password') {
    const ctl = this.form.controls[c];
    return ctl.invalid && (ctl.touched || ctl.dirty);
  }

  submit() {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => { this.busy.set(false); this.router.navigateByUrl('/'); },
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(e.status === 409 ? 'An account with that email already exists. Try logging in.' : 'Something went wrong. Please try again.');
      },
    });
  }

  onGoogle(credential: string) {
    this.error.set('');
    this.busy.set(true);
    this.auth.loginWithGoogle(credential).subscribe({
      next: () => { this.busy.set(false); this.router.navigateByUrl('/'); },
      error: () => { this.busy.set(false); this.error.set('Google sign-in failed. Please try again.'); },
    });
  }
}
