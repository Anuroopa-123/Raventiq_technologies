import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PosterService } from '../core/poster.service';
import { Poster } from '../core/models';

/** Create / edit / delete posters. Used by both the admin and superadmin
 * dashboards -- posters are the one thing both roles can manage. */
@Component({
  selector: 'app-poster-manager',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="glass form-card">
      <h3>{{ editingId() ? 'Edit poster' : 'Add a new poster' }}</h3>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label>Title
          <input formControlName="title" placeholder="Free 3-Day Workshop -- Batch 4" />
        </label>
        <label>Description <span class="opt">(optional)</span>
          <textarea formControlName="description" rows="3" placeholder="Short caption shown under the poster"></textarea>
        </label>
        <div class="row">
          <label>Link <span class="opt">(optional)</span>
            <input formControlName="link_url" placeholder="https://instagram.com/..." />
          </label>
          <label class="check">
            <input type="checkbox" formControlName="is_active" />
            Visible on the website
          </label>
        </div>
        <label>Image {{ editingId() ? '(leave empty to keep the current one)' : '' }}
          <input type="file" accept="image/png,image/jpeg,image/webp" (change)="onFile($event)" #fileInput />
        </label>
        @if (preview()) { <img class="preview" [src]="preview()" alt="" /> }
        @if (error()) { <p class="err box" role="alert">{{ error() }}</p> }
        <div class="actions">
          <button class="btn primary" type="submit" [disabled]="busy()">
            {{ busy() ? 'Saving…' : editingId() ? 'Save changes' : 'Publish poster' }}
          </button>
          @if (editingId()) { <button class="btn soft" type="button" (click)="cancelEdit(fileInput)">Cancel</button> }
        </div>
      </form>
    </div>

    <div class="glass list-card">
      <h3>All posters</h3>
      @if (loading()) {
        <p class="muted">Loading…</p>
      } @else if (!posters().length) {
        <p class="muted">No posters yet. The one above will be the first.</p>
      } @else {
        <ul class="plist">
          @for (p of posters(); track p.id) {
            <li [class.hidden-poster]="!p.is_active">
              <img [src]="p.image_url" [alt]="p.title" />
              <div class="meta">
                <b>{{ p.title }}</b>
                <span class="tag" [class.on]="p.is_active">{{ p.is_active ? 'Visible' : 'Hidden' }}</span>
                @if (p.description) { <p>{{ p.description }}</p> }
              </div>
              <div class="row-actions">
                <button class="btn soft sm" type="button" (click)="edit(p)">Edit</button>
                <button class="btn soft sm danger" type="button" (click)="remove(p)">Delete</button>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './poster-manager.scss',
})
export class PosterManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(PosterService);

  posters = signal<Poster[]>([]);
  loading = signal(true);
  busy = signal(false);
  error = signal('');
  editingId = signal<number | null>(null);
  preview = signal<string | null>(null);
  private file: File | null = null;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(160)]],
    description: [''],
    link_url: [''],
    is_active: [true],
  });

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.api.listAll().subscribe({
      next: (rows) => { this.posters.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
    this.preview.set(this.file ? URL.createObjectURL(this.file) : null);
  }

  edit(p: Poster) {
    this.editingId.set(p.id);
    this.form.setValue({
      title: p.title, description: p.description ?? '', link_url: p.link_url ?? '', is_active: p.is_active,
    });
    this.preview.set(p.image_url);
    this.file = null;
    this.error.set('');
  }

  cancelEdit(fileInput: HTMLInputElement) {
    this.editingId.set(null);
    this.form.reset({ title: '', description: '', link_url: '', is_active: true });
    this.preview.set(null);
    this.file = null;
    fileInput.value = '';
  }

  submit() {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const id = this.editingId();
    if (!id && !this.file) { this.error.set('Please choose an image for the poster.'); return; }

    this.busy.set(true);
    const payload = { ...this.form.getRawValue(), image: this.file };
    const req = id ? this.api.update(id, payload) : this.api.create(payload);
    req.subscribe({
      next: () => {
        this.busy.set(false);
        this.form.reset({ title: '', description: '', link_url: '', is_active: true });
        this.editingId.set(null);
        this.preview.set(null);
        this.file = null;
        this.refresh();
      },
      error: () => { this.busy.set(false); this.error.set('Could not save the poster. Please check the image (JPEG/PNG/WebP, under 5MB) and try again.'); },
    });
  }

  remove(p: Poster) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    this.api.remove(p.id).subscribe({ next: () => this.refresh() });
  }
}
