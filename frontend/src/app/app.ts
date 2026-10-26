import { Component, ElementRef, HostListener, NgZone, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SceneComponent } from './scene/scene.component';
import { LogoComponent } from './components/logo';
import { AuthService } from './core/auth.service';
import { MagneticDirective } from './directives/magnetic';
import { ScrollProgressComponent } from './shared/scroll-progress';
import { ContactService } from './services/contact.service';
import { SECTIONS, SOLUTIONS, SITE } from './site.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SceneComponent, LogoComponent, MagneticDirective, ScrollProgressComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  s = SITE;
  sections = SECTIONS;
  solutions = SOLUTIONS;
  year = new Date().getFullYear();
  auth = inject(AuthService);
  private contact = inject(ContactService);
  private router = inject(Router);
  @ViewChild('glow', { static: true }) glow!: ElementRef<HTMLElement>;
  private zone = inject(NgZone);
  menu = signal(false);
  scrolled = signal(false);
  legalModal = signal<'privacy' | 'terms' | 'security' | null>(null);

  ngOnInit() {
    // soft ambient light cursor follower
    this.zone.runOutsideAngular(() => {
      if (matchMedia('(pointer: coarse)').matches) return;
      let x = 0, y = 0, raf = 0;
      addEventListener('pointermove', (e) => {
        x = e.clientX - 160; y = e.clientY - 160;
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; this.glow.nativeElement.style.transform = `translate(${x}px,${y}px)`; });
      }, { passive: true });
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const v = scrollY > 30;
    if (v !== this.scrolled()) this.scrolled.set(v);
  }

  go(ev: Event, id: string, service?: string) {
    ev.preventDefault();
    this.menu.set(false);
    if (service) this.contact.prefill.set(service);
    if (this.router.url.split(/[?#]/)[0] === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.router.navigate(['/'], { fragment: id }).then(() => {
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      });
    }
  }

  openLegal(type: 'privacy' | 'terms' | 'security') {
    this.legalModal.set(type);
  }

  closeLegal() {
    this.legalModal.set(null);
  }

  logout() {
    this.menu.set(false);
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
