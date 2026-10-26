import { SlicePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../core/admin.service';
import { AuthService } from '../core/auth.service';
import { AdminStats, AuthUser, ContactMessageRow } from '../core/models';
import { PosterManagerComponent } from '../shared/poster-manager';

type Tab = 'registrations' | 'admins' | 'posters' | 'enquiries';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, PosterManagerComponent, SlicePipe],
  template: `
    <div class="dash">
      <div class="head">
        <span class="eyebrow">Owner dashboard</span>
        <h1>Welcome back, {{ auth.user()?.name }} 👑</h1>
        <p>Everything that happens on the site, in one place.</p>
      </div>

      @if (stats(); as s) {
        <div class="stats">
          <div class="glass stat"><b>{{ s.students }}</b><span>Students registered</span></div>
          <div class="glass stat"><b>{{ s.admins }}</b><span>Admins</span></div>
          <div class="glass stat"><b>{{ s.posters }}</b><span>Posters</span></div>
          <div class="glass stat"><b>{{ s.contact_messages }}</b><span>Enquiries</span></div>
        </div>
      }

      <div class="tabs">
        <button type="button" [class.active]="tab() === 'registrations'" (click)="setTab('registrations')">Registrations</button>
        <button type="button" [class.active]="tab() === 'admins'" (click)="setTab('admins')">Admins</button>
        <button type="button" [class.active]="tab() === 'posters'" (click)="setTab('posters')">Posters</button>
        <button type="button" [class.active]="tab() === 'enquiries'" (click)="setTab('enquiries')">Contact enquiries</button>
      </div>

      @if (tab() === 'registrations') {
        <section class="block">
          <h2>📋 Everyone who registered</h2>
          <div class="glass table-card scroll-x">
            @if (loadingUsers()) {
              <p class="muted">Loading…</p>
            } @else if (!users().length) {
              <p class="muted">No registrations yet.</p>
            } @else {
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>College</th><th>Role</th><th>Signed up with</th><th>Joined</th></tr></thead>
                <tbody>
                  @for (u of users(); track u.id) {
                    <tr>
                      <td>{{ u.name }}</td>
                      <td>{{ u.email }}</td>
                      <td>{{ u.phone || '—' }}</td>
                      <td>{{ u.college || '—' }}</td>
                      <td><span class="role-chip" [class]="u.role">{{ u.role }}</span></td>
                      <td class="via">{{ u.has_google ? 'Google' : 'Password' }}</td>
                      <td>{{ u.created_at | slice:0:10 }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </section>
      }

      @if (tab() === 'admins') {
        <section class="block">
          <h2>🔑 Admin accounts</h2>
          <div class="glass new-admin">
            <form [formGroup]="adminForm" (ngSubmit)="createAdmin()">
              <label>Name <input formControlName="name" placeholder="Dinesh" /></label>
              <label>Email <input formControlName="email" type="email" placeholder="dinesh@raventiq.com" /></label>
              <label>Password <input formControlName="password" type="password" placeholder="At least 8 characters" /></label>
              <button class="btn primary" type="submit" [disabled]="creatingAdmin()">{{ creatingAdmin() ? 'Creating…' : '+ Add admin' }}</button>
              @if (adminError()) { <p class="err">{{ adminError() }}</p> }
            </form>
          </div>
          <div class="glass table-card scroll-x">
            @if (!admins().length) {
              <p class="muted">No admins yet. Create one above.</p>
            } @else {
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th></th></tr></thead>
                <tbody>
                  @for (a of admins(); track a.id) {
                    <tr>
                      <td>{{ a.name }}</td>
                      <td>{{ a.email }}</td>
                      <td>{{ a.is_active ? 'Active' : 'Deactivated' }}</td>
                      <td>{{ a.created_at | slice:0:10 }}</td>
                      <td>
                        <button class="btn soft xs" type="button" (click)="toggleAdmin(a)">{{ a.is_active ? 'Deactivate' : 'Reactivate' }}</button>
                        <button class="btn soft xs danger" type="button" (click)="removeAdmin(a)">Remove</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </section>
      }

      @if (tab() === 'posters') {
        <section class="block">
          <h2>🖼️ Posters</h2>
          <app-poster-manager />
        </section>
      }

      @if (tab() === 'enquiries') {
        <section class="block">
          <h2>✉️ Contact form enquiries</h2>
          <div class="glass table-card scroll-x">
            @if (!messages().length) {
              <p class="muted">No messages yet.</p>
            } @else {
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Service</th><th>Message</th><th>Email</th><th>Sent</th></tr></thead>
                <tbody>
                  @for (m of messages(); track m.id) {
                    <tr>
                      <td>{{ m.name }}</td>
                      <td>{{ m.email }}</td>
                      <td>{{ m.service || '—' }}</td>
                      <td class="msg-body">{{ m.message }}</td>
                      <td>{{ m.email_status }}</td>
                      <td>{{ m.created_at | slice:0:10 }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </section>
      }
    </div>
  `,
  styleUrl: './dashboard.scss',
})
export class SuperadminDashboardPage implements OnInit {
  private api = inject(AdminService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  tab = signal<Tab>('registrations');
  stats = signal<AdminStats | null>(null);
  users = signal<AuthUser[]>([]);
  loadingUsers = signal(true);
  messages = signal<ContactMessageRow[]>([]);
  creatingAdmin = signal(false);
  adminError = signal('');

  adminForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  admins() {
    return this.users().filter((u) => u.role === 'admin');
  }

  ngOnInit() {
    this.api.stats().subscribe((s) => this.stats.set(s));
    this.loadUsers();
    this.api.contactMessages().subscribe((rows) => this.messages.set(rows));
  }

  setTab(t: Tab) {
    this.tab.set(t);
  }

  loadUsers() {
    this.loadingUsers.set(true);
    this.api.registrations().subscribe({
      next: (rows) => { this.users.set(rows); this.loadingUsers.set(false); },
      error: () => this.loadingUsers.set(false),
    });
  }

  createAdmin() {
    this.adminError.set('');
    if (this.adminForm.invalid) { this.adminForm.markAllAsTouched(); return; }
    this.creatingAdmin.set(true);
    this.api.createAdmin(this.adminForm.getRawValue()).subscribe({
      next: () => {
        this.creatingAdmin.set(false);
        this.adminForm.reset({ name: '', email: '', password: '' });
        this.loadUsers();
        this.api.stats().subscribe((s) => this.stats.set(s));
      },
      error: (e: HttpErrorResponse) => {
        this.creatingAdmin.set(false);
        this.adminError.set(e.status === 409 ? 'An account with that email already exists.' : 'Could not create the admin. Please try again.');
      },
    });
  }

  toggleAdmin(a: AuthUser) {
    this.api.setAdminActive(a.id, !a.is_active).subscribe(() => this.loadUsers());
  }

  removeAdmin(a: AuthUser) {
    if (!confirm(`Remove admin "${a.name}"? They will no longer be able to log in.`)) return;
    this.api.deleteAdmin(a.id).subscribe(() => {
      this.loadUsers();
      this.api.stats().subscribe((s) => this.stats.set(s));
    });
  }
}
