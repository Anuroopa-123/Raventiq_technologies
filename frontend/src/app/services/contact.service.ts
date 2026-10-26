import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  website?: string; // honeypot
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  /** Set by "Enquire" buttons so the form opens with the service already chosen. */
  prefill = signal<string | null>(null);

  // Relative URL: in dev the proxy forwards /api to FastAPI; in production nginx does.
  send(payload: ContactPayload) {
    return this.http.post<{ id: number; detail: string }>('/api/contact', payload);
  }
}
