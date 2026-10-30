import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { animate } from 'motion';
import { AuthService } from '../core/auth.service';
import { Poster } from '../core/models';
import { PosterService } from '../core/poster.service';
import { RevealDirective } from '../directives/reveal';
import { TiltDirective } from '../directives/tilt';
import { MagneticDirective } from '../directives/magnetic';
import { SceneService } from '../scene/scene.service';
import { ContactFormComponent } from '../sections/contact-form';
import { ContactService } from '../services/contact.service';
import {
  SECTIONS,
  SOLUTIONS,
  CAPABILITIES,
  PROJECTS,
  PROCESS_STAGES,
  INSIGHTS,
  SITE,
  WORDS,
  INTERNSHIP_TRACKS,
  FAQS,
  InternshipTrack,
  FaqItem,
} from '../site.config';

export interface HeroPanel {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  status: string;
  metric1: { val: string; lbl: string };
  metric2: { val: string; lbl: string };
  code: string;
  color: 'lime' | 'cobalt' | 'navy';
}

import { GalleryTunnelComponent } from '../components/gallery-tunnel';
import { ScrollMorphHeroComponent } from '../components/scroll-morph-hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RevealDirective,
    TiltDirective,
    MagneticDirective,
    ContactFormComponent,
    GalleryTunnelComponent,
    ScrollMorphHeroComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  private contact = inject(ContactService);
  private posterApi = inject(PosterService);
  scene = inject(SceneService);
  auth = inject(AuthService);

  s = SITE;
  sections = SECTIONS;
  solutions = SOLUTIONS;
  capabilities = CAPABILITIES;
  projects = PROJECTS;
  processStages = PROCESS_STAGES;
  insights = INSIGHTS;
  words = [...WORDS, ...WORDS];

  posters = signal<Poster[]>([]);
  postersLoading = signal(true);

  // 3-Panel 3D Carousel in Hero Section
  activeHeroSlide = signal(0);
  isHeroHovered = signal(false);
  private heroTimer: any = null;

  @ViewChildren('panelEl') panelEls?: QueryList<ElementRef<HTMLElement>>;

  heroPanels: HeroPanel[] = [
    {
      id: 'ai-core',
      badge: 'Multimodal AI Core',
      title: 'Multimodal Sensory Graph',
      subtitle: 'Real-time vision & polyphonic speech reasoning engine with sub-120ms streaming latency.',
      status: 'NEURAL CLUSTER · STREAMING',
      metric1: { val: '<120ms', lbl: 'Streaming Latency' },
      metric2: { val: '1M Tokens', lbl: 'Context Horizon' },
      code: `const cluster = await Raventiq.init({\n  mode: 'multimodal-stream',\n  eval: 'deterministic-rag'\n});`,
      color: 'lime',
    },
    {
      id: 'agentic-swarm',
      badge: 'Autonomous Swarm',
      title: 'Self-Healing Agent Mesh',
      subtitle: 'Hierarchical multi-agent controller orchestrating distributed event pipelines with guaranteed delivery.',
      status: 'AGENT SWARM · 64 WORKERS',
      metric1: { val: '1,400/s', lbl: 'Task Throughput' },
      metric2: { val: '99.8%', lbl: 'Self-Healing SLA' },
      code: `const agent = await Swarm.dispatch({\n  graph: 'ledger-reconciliation',\n  guardrails: 'strict-zero-trust'\n});`,
      color: 'cobalt',
    },
    {
      id: 'edge-platform',
      badge: 'Edge Engineering',
      title: 'Flagship Digital Platform',
      subtitle: 'Industrial-grade web architecture with sub-30ms global edge TTFB and zero layout shift.',
      status: 'GLOBAL EDGE · HYDRATED',
      metric1: { val: '100 / 100', lbl: 'Core Web Vitals' },
      metric2: { val: '28ms', lbl: 'Edge TTFB' },
      code: `export default definePlatform({\n  edgeWorkers: 12,\n  optimisticState: true\n});`,
      color: 'navy',
    },
  ];

  // Horizontal Carousel for "02 / CORE TECH STACK"
  @ViewChild('capCarouselTrack') capCarouselTrack?: ElementRef<HTMLElement>;
  canScrollCapLeft = signal(false);
  canScrollCapRight = signal(true);
  activeCapCardIndex = signal(0);
  isCapHovered = signal(false);
  private capAutoScrollTimer: any = null;

  // Active capability index for detail view or modal
  activeCapability = signal(0);
  @ViewChild('capPanel') capPanel?: ElementRef<HTMLElement>;

  // 3D Coverflow Gallery for "How We Work" (Process Stages)
  activeProcessIndex = signal(0);
  isProcessHovered = signal(false);
  private processTimer: any = null;

  // Interactive modals
  selectedProject = signal<any | null>(null);
  selectedArticle = signal<any | null>(null);

  // College Student Internship Program
  internshipTracks = INTERNSHIP_TRACKS;
  selectedTrack = signal<InternshipTrack | null>(null);

  // Interactive FAQ Accordion
  faqs = FAQS;
  openFaqId = signal<string | null>('faq-1');

  toggleFaq(id: string) {
    this.openFaqId.update((curr) => (curr === id ? null : id));
  }

  isFaqOpen(id: string): boolean {
    return this.openFaqId() === id;
  }

  openTrack(t: InternshipTrack) {
    this.selectedTrack.set(t);
  }

  closeTrack() {
    this.selectedTrack.set(null);
  }

  applyForTrack(t: InternshipTrack, ev: Event) {
    this.closeTrack();
    this.go(ev, 'contact', `College Internship - ${t.title}`);
  }

  ngOnInit() {
    this.posterApi.list().subscribe({
      next: (rows) => {
        this.posters.set(rows);
        this.postersLoading.set(false);
      },
      error: () => this.postersLoading.set(false),
    });
  }

  ngAfterViewInit() {
    // Initial entrance animation of the 3 layered 3D panels
    setTimeout(() => {
      this.applyStackMotion(0, 0, true);
    }, 120);
    this.startHeroCarousel();
    this.startProcessAutoplay();
    this.startCapAutoplay();
  }

  ngOnDestroy() {
    this.stopHeroCarousel();
    this.stopProcessAutoplay();
    this.stopCapAutoplay();
  }

  startHeroCarousel() {
    this.stopHeroCarousel();
    this.heroTimer = setInterval(() => {
      if (!this.isHeroHovered()) {
        this.nextHeroSlide();
      }
    }, 4200);
  }

  stopHeroCarousel() {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
      this.heroTimer = null;
    }
  }

  nextHeroSlide() {
    const next = (this.activeHeroSlide() + 1) % this.heroPanels.length;
    this.setHeroSlide(next);
  }

  prevHeroSlide() {
    const prev = (this.activeHeroSlide() - 1 + this.heroPanels.length) % this.heroPanels.length;
    this.setHeroSlide(prev);
  }

  setHeroSlide(i: number) {
    if (i === this.activeHeroSlide()) return;
    const prev = this.activeHeroSlide();
    this.activeHeroSlide.set(i);
    this.applyStackMotion(prev, i, false);
  }

  pauseHero(pause: boolean) {
    this.isHeroHovered.set(pause);
  }

  /**
   * Motion animation engine for the 3 layered panels:
   * Uses realistic 3D depth, translate3d, scale, and subtle rotateY.
   * Slide 1: Foreground panel in crisp focus, background panels visible behind at offsets.
   * Slide 2: Foreground panel smoothly moves sideways and slightly backward,
   *          while the second panel glides forward into the main position.
   * Slide 3: Next panel follows, continuously cycling through the layered stack.
   */
  applyStackMotion(prevActive: number, newActive: number, isInitial = false) {
    if (!this.panelEls || typeof matchMedia === 'undefined') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = this.panelEls.toArray();
    const total = this.heroPanels.length;
    if (!els.length) return;

    // The 3 precisely calculated 3D depth positions
    // Pos 0: Foreground, centered & prominent (z-index 30)
    // Pos 1: Middle depth, peeking out 42px right and 24px above Pos 0 (z-index 20)
    // Pos 2: Furthest depth, peeking out 82px right and 46px above Pos 0 (z-index 10)
    const posTransforms = {
      0: {
        transform: 'translate3d(0px, 0px, 30px) scale(1) rotateY(-2deg)',
        opacity: 1,
        zIndex: '30',
      },
      1: {
        transform: 'translate3d(42px, -24px, -40px) scale(0.92) rotateY(-5deg)',
        opacity: 0.88,
        zIndex: '20',
      },
      2: {
        transform: 'translate3d(82px, -46px, -100px) scale(0.85) rotateY(-8deg)',
        opacity: 0.74,
        zIndex: '10',
      },
    };

    if (isInitial) {
      els.forEach((elRef, idx) => {
        const el = elRef.nativeElement;
        const pos = (idx - newActive + total) % total as 0 | 1 | 2;
        const target = posTransforms[pos];
        el.style.zIndex = target.zIndex;
        animate(
          el,
          {
            transform: [
              'translate3d(0px, 40px, -80px) scale(0.88) rotateY(0deg)',
              target.transform,
            ],
            opacity: [0, target.opacity],
          },
          {
            duration: 0.85,
            delay: idx * 0.12,
            ease: [0.16, 1, 0.3, 1],
          }
        );
      });
      return;
    }

    const isForward = (newActive - prevActive + total) % total === 1;

    els.forEach((elRef, idx) => {
      const el = elRef.nativeElement;
      const oldPos = (idx - prevActive + total) % total as 0 | 1 | 2;
      const newPos = (idx - newActive + total) % total as 0 | 1 | 2;

      if (oldPos === 0 && newPos === 2 && isForward) {
        // Slide 2 requirement: Foreground panel smoothly moves sideways and slightly backward,
        // while receding to the back of the stack
        el.style.zIndex = '25';
        animate(
          el,
          {
            transform: [
              'translate3d(0px, 0px, 30px) scale(1) rotateY(-2deg)',
              'translate3d(-96px, 24px, 0px) scale(0.95) rotateY(14deg)',
              posTransforms[2].transform,
            ],
            opacity: [1, 0.92, posTransforms[2].opacity],
          },
          {
            duration: 0.95,
            ease: [0.16, 1, 0.3, 1],
          }
        );
        setTimeout(() => {
          if (this.getSlidePosition(idx) === 2) {
            el.style.zIndex = posTransforms[2].zIndex;
          }
        }, 420);
      } else if (newPos === 0) {
        // Incoming panel smoothly glides forward into the main foreground position
        el.style.zIndex = posTransforms[0].zIndex;
        const startTransform = oldPos === 1 ? posTransforms[1].transform : posTransforms[2].transform;
        const startOpacity = oldPos === 1 ? posTransforms[1].opacity : posTransforms[2].opacity;
        animate(
          el,
          {
            transform: [startTransform, posTransforms[0].transform],
            opacity: [startOpacity, 1],
          },
          {
            duration: 0.88,
            ease: [0.16, 1, 0.3, 1],
          }
        );
      } else if (newPos === 1) {
        // Glides into middle depth position
        el.style.zIndex = posTransforms[1].zIndex;
        const startTransform = oldPos === 2 ? posTransforms[2].transform : posTransforms[0].transform;
        const startOpacity = oldPos === 2 ? posTransforms[2].opacity : posTransforms[0].opacity;
        animate(
          el,
          {
            transform: [startTransform, posTransforms[1].transform],
            opacity: [startOpacity, posTransforms[1].opacity],
          },
          {
            duration: 0.88,
            ease: [0.16, 1, 0.3, 1],
          }
        );
      } else {
        // Any backward or direct jump transition
        el.style.zIndex = posTransforms[newPos].zIndex;
        animate(
          el,
          {
            transform: [posTransforms[oldPos].transform, posTransforms[newPos].transform],
            opacity: [posTransforms[oldPos].opacity, posTransforms[newPos].opacity],
          },
          {
            duration: 0.88,
            ease: [0.16, 1, 0.3, 1],
          }
        );
      }
    });
  }

  /**
   * Returns positional index relative to the active slide:
   * 0: Foreground (active)
   * 1: Middle (behind right)
   * 2: Background (furthest behind)
   */
  getSlidePosition(idx: number): number {
    const total = this.heroPanels.length;
    return (idx - this.activeHeroSlide() + total) % total;
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // Horizontal Carousel controls for Core Tech Stack (02 / CORE TECH STACK)
  scrollCapCarousel(dir: 'left' | 'right') {
    const el = this.capCarouselTrack?.nativeElement;
    if (!el) return;
    const cardWidth = 360; // Card width + gap
    const scrollAmount = dir === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.updateCapScrollState(), 320);
  }

  scrollToCapCard(index: number) {
    const el = this.capCarouselTrack?.nativeElement;
    if (!el) return;
    const cards = el.querySelectorAll('.cap-slide-card');
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
      this.activeCapCardIndex.set(index);
    }
  }

  onCapScroll() {
    this.updateCapScrollState();
  }

  updateCapScrollState() {
    const el = this.capCarouselTrack?.nativeElement;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    this.canScrollCapLeft.set(el.scrollLeft > 10);
    this.canScrollCapRight.set(el.scrollLeft < maxScroll - 10);

    // Estimate active card based on scroll position
    const cardWidth = 360;
    const currentIdx = Math.round(el.scrollLeft / cardWidth);
    this.activeCapCardIndex.set(Math.min(Math.max(currentIdx, 0), this.capabilities.length - 1));
  }

  startCapAutoplay() {
    this.stopCapAutoplay();
    this.capAutoScrollTimer = setInterval(() => {
      if (!this.isCapHovered()) {
        const el = this.capCarouselTrack?.nativeElement;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 20) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          this.scrollCapCarousel('right');
        }
      }
    }, 4500);
  }

  stopCapAutoplay() {
    if (this.capAutoScrollTimer) {
      clearInterval(this.capAutoScrollTimer);
      this.capAutoScrollTimer = null;
    }
  }

  pickCapability(i: number) {
    if (i === this.activeCapability()) return;
    this.activeCapability.set(i);

    setTimeout(() => {
      const el = this.capPanel?.nativeElement;
      if (!el || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
      animate(
        el,
        { opacity: [0, 1], x: [28, 0], scale: [0.98, 1] },
        { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
      );
    });
  }

  openProject(p: any) {
    this.selectedProject.set(p);
  }

  closeProject() {
    this.selectedProject.set(null);
  }

  openArticle(a: any) {
    this.selectedArticle.set(a);
  }

  closeArticle() {
    this.selectedArticle.set(null);
  }

  go(ev: Event, id: string, service?: string) {
    ev.preventDefault();
    if (service) this.contact.prefill.set(service);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Coverflow Gallery (Process Section) Methods
  startProcessAutoplay() {
    this.stopProcessAutoplay();
    this.processTimer = setInterval(() => {
      if (!this.isProcessHovered()) {
        this.nextProcessSlide();
      }
    }, 4200);
  }

  stopProcessAutoplay() {
    if (this.processTimer) {
      clearInterval(this.processTimer);
      this.processTimer = null;
    }
  }

  nextProcessSlide() {
    const next = (this.activeProcessIndex() + 1) % this.processStages.length;
    this.setProcessSlide(next);
  }

  prevProcessSlide() {
    const prev = (this.activeProcessIndex() - 1 + this.processStages.length) % this.processStages.length;
    this.setProcessSlide(prev);
  }

  setProcessSlide(i: number) {
    this.activeProcessIndex.set(i);
  }

  handleProcessCardClick(i: number) {
    if (i === this.activeProcessIndex()) {
      this.nextProcessSlide();
    } else {
      this.setProcessSlide(i);
    }
  }

  pauseProcess(pause: boolean) {
    this.isProcessHovered.set(pause);
  }

  getProcessRel(i: number): number {
    const active = this.activeProcessIndex();
    const n = this.processStages.length;
    let rel = i - active;
    if (rel > n / 2) rel -= n;
    if (rel < -n / 2) rel += n;
    return rel;
  }

  abs(n: number): number {
    return Math.abs(n);
  }

  onProcessKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.nextProcessSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prevProcessSlide();
    }
  }
}
