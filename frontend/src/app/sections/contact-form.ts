import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ContactService } from '../services/contact.service';
import { SceneService } from '../scene/scene.service';
import { SERVICES } from '../site.config';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (done()) {
      <div class="success" role="status">
        <div class="tick">✓</div>
        <h3>Message sent!</h3>
        <p>Thank you. We have received your message and will reply soon. A confirmation is on its way to your email.</p>
        <button class="btn soft" type="button" (click)="reset()">Send another</button>
      </div>
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="row">
          <label>Name *
            <input formControlName="name" autocomplete="name" placeholder="Your full name" />
            @if (bad('name')) { <small class="err">Please enter your name (at least 2 letters).</small> }
          </label>
          <label>Email *
            <input formControlName="email" type="email" autocomplete="email" placeholder="you@example.com" />
            @if (bad('email')) { <small class="err">Please enter a valid email address.</small> }
          </label>
        </div>
        <div class="row">
          <label>Phone / WhatsApp
            <input formControlName="phone" type="tel" autocomplete="tel" placeholder="+91 ..." />
          </label>
          <label>I am interested in
            <select formControlName="service">
              <option value="">Select a service</option>
              @for (sv of services; track sv.title) { <option [value]="sv.title">{{ sv.title }}</option> }
              <option value="Something else">Something else</option>
            </select>
          </label>
        </div>
        <label>Message *
          <textarea formControlName="message" rows="5" placeholder="Tell us about your project, or where you are stuck in coding..."></textarea>
          @if (bad('message')) { <small class="err">Please write at least 10 characters.</small> }
        </label>
        <input class="hp" formControlName="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
        @if (error()) { <p class="err box" role="alert">{{ error() }}</p> }
        <button class="btn primary" type="submit" [disabled]="sending()">{{ sending() ? 'Sending...' : 'Send message ☀' }}</button>
      </form>
    }
  `,
  styleUrl: './contact-form.scss',
})
export class ContactFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(ContactService);
  private scene = inject(SceneService);

  services = SERVICES;
  sending = signal(false);
  done = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    service: [''],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(3000)]],
    website: [''],
  });

  constructor() {
    // "Enquire" buttons elsewhere on the page pre-select a service here
    effect(() => {
      const pre = this.api.prefill();
      if (pre) { this.form.patchValue({ service: pre }); this.api.prefill.set(null); }
    });
    // the 3D sun wobbles while you type
    this.form.valueChanges.subscribe(() => this.scene.pulse(0.18));
  }

  bad(c: 'name' | 'email' | 'message') {
    const ctl = this.form.controls[c];
    return ctl.invalid && (ctl.touched || ctl.dirty);
  }

  submit() {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.sending.set(true);
    this.api.send(this.form.getRawValue()).subscribe({
      next: () => { this.sending.set(false); this.done.set(true); this.scene.burst(); },
      error: (e: HttpErrorResponse) => {
        this.sending.set(false);
        this.error.set(
          e.status === 429 ? 'Too many messages. Please try again in a few minutes.'
          : e.status === 422 ? 'Please check your details and try again.'
          : 'Sorry, something went wrong. Please try again, or email us directly.',
        );
      },
    });
  }

  reset() { this.form.reset(); this.done.set(false); }
}
