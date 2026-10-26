import { Component, Input } from '@angular/core';
import { SITE } from '../site.config';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <span class="logo">
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" role="img" aria-label="Raventiq logo">
        <defs>
          <linearGradient id="ravGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#2939D9" />
            <stop offset="100%" stop-color="#101947" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="url(#ravGrad)" />
        <path d="M18 46V18H32C38.6274 18 44 23.3726 44 30C44 35.2536 40.6277 39.7188 35.8824 41.3435L46 46H38L29 42H24V46H18ZM24 36H32C35.3137 36 38 33.3137 38 30C38 26.6863 35.3137 24 32 24H24V36Z" fill="#C5FF3D" />
        <circle cx="48" cy="18" r="4.5" fill="#C5FF3D" />
      </svg>
      @if (text) {
        <span class="word">
          <b [class.light]="light">{{ s.short }}<span class="dot">.tech</span></b>
          <small [class.light]="light">INTELLIGENCE &middot; INNOVATION</small>
        </span>
      }
    </span>
  `,
  styles: `
    .logo { display: inline-flex; align-items: center; gap: 12px; }
    .word { display: flex; flex-direction: column; line-height: 1; }
    b { font-family: var(--font-head); font-size: 1.35rem; font-weight: 800; letter-spacing: -.03em; color: var(--navy); }
    b.light { color: #ffffff; }
    .dot { color: #C5FF3D; }
    small { font-size: .58rem; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); margin-top: 4px; font-weight: 700; }
    small.light { color: rgba(255, 255, 255, 0.7); }
    svg { flex: none; filter: drop-shadow(0 4px 12px rgba(41, 57, 217, .25)); transition: transform .25s ease; }
    .logo:hover svg { transform: scale(1.05); }
  `,
})
export class LogoComponent {
  @Input() size = 40;
  @Input() text = true;
  @Input() light = false;
  s = SITE;
}
