import { Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { animate, inView } from 'motion';

/**
 * Scroll-triggered entrance animation, powered by the `motion` library
 * (spring-eased blur + rise + scale) instead of a plain CSS transition.
 * Usage unchanged: `appReveal` or `appReveal="160"` (delay in ms).
 */
@Directive({ selector: '[appReveal]', standalone: true, host: { class: 'reveal' } })
export class RevealDirective implements OnInit, OnDestroy {
  @Input('appReveal') delay: number | string = 0;
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private zone = inject(NgZone);
  private stop?: () => void;

  ngOnInit() {
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.el.classList.add('in');
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.stop = inView(
        this.el,
        () => {
          this.el.classList.add('in');
          animate(
            this.el,
            {
              opacity: [0, 1],
              y: [38, 0],
              scale: [0.965, 1],
              filter: ['blur(10px)', 'blur(0px)'],
            },
            {
              duration: 0.9,
              delay: (Number(this.delay) || 0) / 1000,
              ease: [0.16, 0.9, 0.2, 1],
            },
          );
        },
        { margin: '0px 0px -8% 0px', amount: 0.12 },
      );
    });
  }

  ngOnDestroy() {
    this.stop?.();
  }
}
