import { Directive, ElementRef, Input, NgZone, OnDestroy, inject } from '@angular/core';
import { animate } from 'motion';

/**
 * "Magnetic" button: nudges toward the pointer on hover and springs back on
 * leave, powered by `motion`. Disabled on touch screens and when the visitor
 * prefers reduced motion. Usage: `appMagnetic` or `appMagnetic="0.4"` (pull strength).
 */
@Directive({ selector: '[appMagnetic]', standalone: true, host: { class: 'magnetic' } })
export class MagneticDirective implements OnDestroy {
  @Input('appMagnetic') strength: number | string = 0.3;
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private off: (() => void)[] = [];

  constructor() {
    inject(NgZone).runOutsideAngular(() => {
      if (typeof matchMedia === 'undefined') return;
      if (matchMedia('(hover: none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const move = (e: PointerEvent) => {
        const r = this.el.getBoundingClientRect();
        const k = Number(this.strength) || 0.3;
        const x = (e.clientX - (r.left + r.width / 2)) * k;
        const y = (e.clientY - (r.top + r.height / 2)) * k;
        animate(this.el, { x, y }, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
      };
      const leave = () => {
        animate(this.el, { x: 0, y: 0 }, { type: 'spring', stiffness: 260, damping: 16 });
      };

      this.el.addEventListener('pointermove', move);
      this.el.addEventListener('pointerleave', leave);
      this.off.push(
        () => this.el.removeEventListener('pointermove', move),
        () => this.el.removeEventListener('pointerleave', leave),
      );
    });
  }

  ngOnDestroy() {
    this.off.forEach((f) => f());
  }
}
