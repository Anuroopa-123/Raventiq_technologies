import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminStats, AuthUser, ContactMessageRow } from './models';

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
}

/** Superadmin-only endpoints: the owner's view of everything. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>('/api/admin/stats');
  }

  registrations(role?: string): Observable<AuthUser[]> {
    const q = role ? `?role=${encodeURIComponent(role)}` : '';
    return this.http.get<AuthUser[]>(`/api/admin/users${q}`);
  }

  contactMessages(): Observable<ContactMessageRow[]> {
    return this.http.get<ContactMessageRow[]>('/api/admin/contact-messages');
  }

  createAdmin(payload: CreateAdminPayload): Observable<AuthUser> {
    return this.http.post<AuthUser>('/api/admin/admins', payload);
  }

  setAdminActive(id: number, isActive: boolean): Observable<AuthUser> {
    return this.http.patch<AuthUser>(`/api/admin/admins/${id}/active?is_active=${isActive}`, {});
  }

  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/admins/${id}`);
  }
}
