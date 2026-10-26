import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { animate } from 'motion';

/** Thin gradient bar pinned to the top of the viewport, its width tied to
 * page-scroll progress via `motion`'s scroll-linked animation helper. */
@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  template: `<div class="rail" aria-hidden="true"><div class="bar" #bar></div></div>`,
  styles: [
    `
    :host { display: block; }
    .rail { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60; pointer-events: none; }
    .bar {
      height: 100%; width: 100%; transform-origin: 0% 50%; transform: scaleX(0);
      background: linear-gradient(90deg, var(--coral), var(--sun) 35%, var(--lav) 70%, var(--sky));
      box-shadow: 0 0 14px rgba(255, 106, 85, .55);
    }
    @media (prefers-reduced-motion: reduce) { .rail { display: none; } }
    `,
  ],
})
export class ScrollProgressComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bar', { static: true }) bar!: ElementRef<HTMLElement>;
  private zone = inject(NgZone);
  private off: (() => void)[] = [];

  ngAfterViewInit() {
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.zone.runOutsideAngular(() => {
      const bar = this.bar.nativeElement;
      let raf = 0;
      // Driven manually (rather than motion's scroll()-linked animation) so
      // the measured document height is always current -- content below the
      // fold (lazy-loaded sections, images) keeps growing the page after
      // first paint, and a one-shot measurement would read as "already done".
      const update = () => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        animate(bar, { scaleX: progress }, { duration: 0.2, ease: 'easeOut' });
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll, { passive: true });
      update();
      this.off.push(
        () => removeEventListener('scroll', onScroll),
        () => removeEventListener('resize', onScroll),
        () => raf && cancelAnimationFrame(raf),
      );
    });
  }

  ngOnDestroy() {
    this.off.forEach((f) => f());
  }
}
