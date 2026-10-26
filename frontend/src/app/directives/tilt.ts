import { Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

/** 3D hover tilt with a moving light glare. Disabled on touch screens. */
@Directive({ selector: '[appTilt]', standalone: true, host: { class: 'tilt' } })
export class TiltDirective implements OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private off: (() => void)[] = [];

  constructor() {
    inject(NgZone).runOutsideAngular(() => {
      if (matchMedia('(hover: none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const move = (e: PointerEvent) => {
        const r = this.el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        this.el.style.setProperty('--rx', `${((0.5 - y) * 14).toFixed(2)}deg`);
        this.el.style.setProperty('--ry', `${((x - 0.5) * 16).toFixed(2)}deg`);
        this.el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        this.el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      };
      const leave = () => {
        this.el.style.setProperty('--rx', '0deg');
        this.el.style.setProperty('--ry', '0deg');
      };
      this.el.addEventListener('pointermove', move);
      this.el.addEventListener('pointerleave', leave);
      this.off.push(() => this.el.removeEventListener('pointermove', move), () => this.el.removeEventListener('pointerleave', leave));
    });
  }
  ngOnDestroy() { this.off.forEach(f => f()); }
}
