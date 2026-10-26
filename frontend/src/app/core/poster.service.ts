import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Poster } from './models';

export interface PosterForm {
  title: string;
  description?: string;
  link_url?: string;
  is_active: boolean;
  image?: File | null;
}

function toFormData(f: PosterForm): FormData {
  const fd = new FormData();
  fd.append('title', f.title);
  if (f.description) fd.append('description', f.description);
  if (f.link_url) fd.append('link_url', f.link_url);
  fd.append('is_active', String(f.is_active));
  if (f.image) fd.append('image', f.image);
  return fd;
}

@Injectable({ providedIn: 'root' })
export class PosterService {
  private http = inject(HttpClient);

  /** public: active posters only */
  list(): Observable<Poster[]> {
    return this.http.get<Poster[]>('/api/posters').pipe(
      catchError(() => of([]))
    );
  }

  /** admin/superadmin: every poster, including hidden ones */
  listAll(): Observable<Poster[]> {
    return this.http.get<Poster[]>('/api/posters/all');
  }

  create(form: PosterForm): Observable<Poster> {
    return this.http.post<Poster>('/api/posters', toFormData(form));
  }

  update(id: number, form: Partial<PosterForm>): Observable<Poster> {
    const fd = new FormData();
    if (form.title !== undefined) fd.append('title', form.title);
    if (form.description !== undefined) fd.append('description', form.description ?? '');
    if (form.link_url !== undefined) fd.append('link_url', form.link_url ?? '');
    if (form.is_active !== undefined) fd.append('is_active', String(form.is_active));
    if (form.image) fd.append('image', form.image);
    return this.http.patch<Poster>(`/api/posters/${id}`, fd);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/posters/${id}`);
  }
}
