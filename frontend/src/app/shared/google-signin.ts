import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { GOOGLE_CLIENT_ID } from '../site.config';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: Record<string, unknown>): void;
          renderButton(el: HTMLElement, opts: Record<string, unknown>): void;
        };
      };
    };
  }
}

/** Renders Google's own "Sign in with Google" button and emits the ID-token
 * credential when the person completes it. Shows nothing if no Google Client ID
 * is configured (see site.config.ts), or if Google's script fails to load
 * (e.g. no internet, or blocked) -- the rest of login/register still works. */
@Component({
  selector: 'app-google-signin',
  standalone: true,
  template: `
    @if (ready) {
      <div class="gbtn" #slot></div>
    } @else if (GOOGLE_CLIENT_ID) {
      <p class="hint">Loading Google sign-in…</p>
    }
  `,
  styles: `
    .gbtn { display: flex; justify-content: center; }
    .hint { text-align: center; font-size: .85rem; color: var(--muted); }
  `,
})
export class GoogleSigninComponent implements OnInit {
  @Input() text: 'signin_with' | 'signup_with' = 'signin_with';
  @Output() credential = new EventEmitter<string>();
  @ViewChild('slot') slot?: ElementRef<HTMLElement>;

  GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID;
  ready = false;
  private host = inject(ElementRef<HTMLElement>);

  ngOnInit() {
    if (!GOOGLE_CLIENT_ID) return;
    this.whenGoogleReady(() => {
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp: { credential: string }) => this.credential.emit(resp.credential),
      });
      this.ready = true;
      // renderButton needs the DOM node to exist, which happens on the next tick
      setTimeout(() => {
        const el = this.host.nativeElement.querySelector('.gbtn') as HTMLElement | null;
        if (el) {
          window.google!.accounts.id.renderButton(el, {
            theme: 'outline', size: 'large', shape: 'pill', width: 320, text: this.text,
          });
        }
      });
    });
  }

  private whenGoogleReady(cb: () => void, attempts = 0) {
    if (window.google?.accounts?.id) return cb();
    if (attempts > 40) return; // ~10s: gave up quietly, button just won't appear
    setTimeout(() => this.whenGoogleReady(cb, attempts + 1), 250);
  }
}
