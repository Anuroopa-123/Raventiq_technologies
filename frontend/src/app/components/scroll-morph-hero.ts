import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type AnimationPhase = 'scatter' | 'line' | 'circle' | 'bottom-strip';

export interface TechSolutionCard {
  id: string;
  targetId: string;
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  specs: string;
  tech: string[];
  src: string;
  accentColor: string;
}

// Exactly 4 Solution Cards mapping 1:1 to the 4 solutions below
const FOUR_SOLUTION_CARDS: TechSolutionCard[] = [
  {
    id: 'frontend-engineering',
    targetId: 'solution-frontend-engineering',
    number: '01',
    badge: 'FRONTEND MASTERY',
    title: 'Modern Frontend',
    subtitle: 'React 19 & Angular 20',
    specs: 'TypeScript · Signals · 60fps',
    tech: ['React 19', 'Angular 20', 'Tailwind', 'Vite'],
    src: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop',
    accentColor: '#C5FF3D',
  },
  {
    id: 'backend-apis',
    targetId: 'solution-backend-apis',
    number: '02',
    badge: 'BACKEND POWER',
    title: 'Cloud APIs & Microservices',
    subtitle: 'Node.js & Python FastAPI',
    specs: 'Async · WebSockets · <25ms',
    tech: ['Python 3.12', 'FastAPI', 'Node.js', 'Docker'],
    src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    accentColor: '#38bdf8',
  },
  {
    id: 'databases-data',
    targetId: 'solution-databases-data',
    number: '03',
    badge: 'DATA INTEGRITY',
    title: 'Relational Data Architecture',
    subtitle: 'PostgreSQL & MySQL',
    specs: '100% ACID · Indexing · Pooling',
    tech: ['PostgreSQL', 'MySQL', 'Prisma', 'SQLAlchemy'],
    src: 'https://images.unsplash.com/photo-1597852074816-d933c4d2b988?q=80&w=800&auto=format&fit=crop',
    accentColor: '#818cf8',
  },
  {
    id: 'smart-ai-integration',
    targetId: 'solution-smart-ai-integration',
    number: '04',
    badge: 'SMART CAPABILITIES',
    title: 'Smart AI & Automation',
    subtitle: 'LLMs & Intelligent Workflows',
    specs: 'Semantic RAG · Auto Extraction',
    tech: ['OpenAI / Gemini', 'LangChain', 'FastAPI', 'pgvector'],
    src: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    accentColor: '#C5FF3D',
  },
];

const TOTAL_CARDS = FOUR_SOLUTION_CARDS.length; // Exactly 4
const MAX_SCROLL = 2400;

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

@Component({
  selector: 'app-scroll-morph-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #containerRef
      class="morph-container"
      tabindex="0"
      role="region"
      aria-label="Interactive 4-Card 3D Architecture Morph Showcase"
    >
      <!-- Ambient Glow and Backdrop -->
      <div class="morph-glow"></div>
      <div class="morph-bottom-fade"></div>

      <!-- Controls & Status Badge (Clean, No third-party names) -->
      <div class="morph-hud">
        <div class="hud-phase-pill">
          <span class="hud-dot"></span>
          <span class="hud-text">
            {{ introPhase() === 'scatter' ? 'INITIALIZING STACK' : introPhase() === 'line' ? 'CONVEYOR ALIGNED' : morphValue() > 0.5 ? 'RAINBOW ARC' : 'ORBITAL CIRCLE' }}
          </span>
        </div>
        <div class="hud-actions">
          <button type="button" class="hud-btn" (click)="stepScroll(-400)" title="Shuffle Left">
            ‹
          </button>
          <button type="button" class="hud-btn" (click)="stepScroll(400)" title="Shuffle Right">
            ›
          </button>
          <button type="button" class="hud-btn hud-reset" (click)="toggleMorph()" title="Toggle View">
            {{ morphValue() > 0.5 ? 'Orbit View' : 'Arc View' }}
          </button>
        </div>
      </div>

      <!-- Center Intro Text (Fades out when morphing to arc) -->
      <div
        class="intro-text-layer"
        [style.opacity]="introPhase() === 'circle' && morphValue() < 0.6 ? 1 - morphValue() * 1.8 : 0"
        [style.transform]="'translateY(' + (morphValue() * 25) + 'px)'"
        [style.pointer-events]="morphValue() < 0.3 ? 'auto' : 'none'"
      >
        <div class="intro-badge">
          <span class="sparkle">✦</span>
          <span>4 CORE FULL-STACK ARCHITECTURES</span>
        </div>
        <h2 class="intro-title">
          Mastering every layer from<br />
          <span class="grad-lime">Frontend to Database.</span>
        </h2>
        <p class="intro-cue">
          SCROLL / DRAG TO MORPH &middot; CLICK ARROW TO JUMP TO CARD
        </p>
      </div>

      <!-- Arc Active Content (Fades in when arc forms) -->
      <div
        class="arc-content-layer"
        [style.opacity]="contentOpacity()"
        [style.transform]="'translateY(' + contentY() + 'px)'"
        [style.pointer-events]="morphValue() > 0.7 ? 'auto' : 'none'"
      >
        <span class="arc-kicker">✦ PRODUCTION ARCHITECTURAL SUITE</span>
        <h3 class="arc-title">Explore Our 4 Core Full-Stack Pillars</h3>
        <p class="arc-desc">
          Click the arrow on any card to navigate directly to its detailed specifications below.
        </p>
      </div>

      <!-- Main 3D Card Stage (Exactly 4 Cards) -->
      <div class="cards-stage">
        @for (card of cards; track card.id; let i = $index) {
          <div
            class="flip-card-wrapper"
            [style.transform]="getCardTransform(i)"
            [style.opacity]="getCardOpacity(i)"
            [style.z-index]="getCardZIndex(i)"
            (click)="scrollToCard(card.targetId, $event)"
          >
            <div class="flip-card-inner">
              <!-- Front Face -->
              <div class="card-face card-front">
                <img
                  [src]="card.src"
                  [alt]="card.title"
                  loading="lazy"
                  class="card-img"
                />
                <div class="card-overlay"></div>

                <!-- Top Badge -->
                <div class="card-top-bar">
                  <span class="badge-num">/{{ card.number }}</span>
                  <span class="badge-label">{{ card.badge }}</span>
                </div>

                <!-- Bottom Title & Navigation Arrow -->
                <div class="card-foot">
                  <div class="foot-info">
                    <p class="foot-title">{{ card.title }}</p>
                    <span class="foot-sub">{{ card.subtitle }}</span>
                  </div>
                  <!-- Arrow Button: Click to jump to solution card below -->
                  <button
                    type="button"
                    class="card-arrow-btn"
                    (click)="scrollToCard(card.targetId, $event)"
                    [title]="'Jump to ' + card.title + ' details below'"
                    aria-label="Jump to details below"
                  >
                    <span class="arrow-ico">↘</span>
                  </button>
                </div>
              </div>

              <!-- Back Face (Revealed on 3D hover) -->
              <div class="card-face card-back">
                <span class="back-badge">{{ card.badge }}</span>
                <h4 class="back-title">{{ card.title }}</h4>
                <p class="back-sub">{{ card.subtitle }}</p>
                <div class="back-specs-pill">{{ card.specs }}</div>

                <div class="back-tech-tags">
                  @for (t of card.tech; track t) {
                    <span class="b-tag">{{ t }}</span>
                  }
                </div>

                <!-- Explicit Arrow Navigation Button -->
                <button
                  type="button"
                  class="back-jump-btn"
                  (click)="scrollToCard(card.targetId, $event)"
                >
                  <span>VIEW DETAILS</span>
                  <span class="arrow-bounce">↓</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Floating Scroll Prompt Pill at Bottom -->
      <div class="morph-scroll-pill">
        <span>Click any card arrow &searr; to jump to full specifications</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        position: relative;
        margin: 28px 0 48px 0;
      }

      .morph-container {
        position: relative;
        width: 100%;
        height: 560px;
        background: #080c24;
        border-radius: 32px;
        overflow: hidden;
        border: 1.5px solid rgba(255, 255, 255, 0.14);
        box-shadow: 0 25px 70px rgba(8, 12, 36, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: 1200px;
        cursor: grab;
        user-select: none;
        touch-action: none;

        &:active {
          cursor: grabbing;
        }
      }

      .morph-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 70% 70% at 50% -10%, rgba(41, 57, 217, 0.45), transparent 75%);
        pointer-events: none;
      }

      .morph-bottom-fade {
        position: absolute;
        bottom: 0;
        inset-x: 0;
        height: 120px;
        background: linear-gradient(to top, #080c24 15%, transparent);
        pointer-events: none;
        z-index: 8;
      }

      /* HUD Header Controls */
      .morph-hud {
        position: absolute;
        top: 20px;
        inset-x: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 25;
        pointer-events: auto;
      }

      .hud-phase-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 6px 14px;
        border-radius: 999px;
        backdrop-filter: blur(8px);
      }

      .hud-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #c5ff3d;
        box-shadow: 0 0 10px #c5ff3d;
        animation: pulseDot 2s infinite;
      }

      @keyframes pulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
      }

      .hud-text {
        font: 700 0.68rem var(--font-head);
        letter-spacing: 0.1em;
        color: #ffffff;
        text-transform: uppercase;
      }

      .hud-actions {
        display: flex;
        gap: 8px;
      }

      .hud-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #ffffff;
        border-radius: 10px;
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        cursor: pointer;
        font-weight: 800;
        transition: all 0.2s;

        &:hover {
          background: #c5ff3d;
          color: #101947;
          border-color: #c5ff3d;
        }

        &.hud-reset {
          width: auto;
          padding: 0 14px;
          font: 700 0.72rem var(--font-head);
          letter-spacing: 0.05em;
        }
      }

      /* Center Intro Text */
      .intro-text-layer {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 5;
        transition: opacity 0.4s ease, transform 0.4s ease;
        max-width: 580px;
        width: 90%;
      }

      .intro-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font: 700 0.68rem var(--font-head);
        letter-spacing: 0.12em;
        background: rgba(41, 57, 217, 0.35);
        border: 1px solid rgba(197, 255, 61, 0.4);
        color: #c5ff3d;
        padding: 4px 12px;
        border-radius: 999px;
        margin-bottom: 12px;
      }

      .intro-title {
        font: 800 clamp(1.6rem, 3.2vw, 2.3rem) var(--font-head);
        color: #ffffff;
        line-height: 1.15;
        margin: 0 0 10px 0;
      }

      .grad-lime {
        color: #c5ff3d;
      }

      .intro-cue {
        font: 700 0.68rem monospace;
        letter-spacing: 0.18em;
        color: #38bdf8;
        margin: 0;
      }

      /* Arc Active Content */
      .arc-content-layer {
        position: absolute;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        z-index: 10;
        max-width: 600px;
        width: 90%;
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .arc-kicker {
        display: inline-block;
        font: 800 0.68rem var(--font-head);
        letter-spacing: 0.12em;
        color: #c5ff3d;
        margin-bottom: 6px;
      }

      .arc-title {
        font: 800 clamp(1.3rem, 2.5vw, 1.9rem) var(--font-head);
        color: #ffffff;
        margin: 0 0 6px 0;
        line-height: 1.2;
      }

      .arc-desc {
        font-size: 0.86rem;
        color: rgba(255, 255, 255, 0.75);
        line-height: 1.45;
        margin: 0;
      }

      /* Stage & 4 Sized Flip Cards */
      .cards-stage {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform-style: preserve-3d;
      }

      .flip-card-wrapper {
        position: absolute;
        width: 148px;
        height: 205px;
        perspective: 1000px;
        transform-style: preserve-3d;
        transition: transform 0.12s linear;
        cursor: pointer;

        &:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
      }

      .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: 20px;
      }

      .card-face {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
        backface-visibility: hidden;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
      }

      /* Front Face */
      .card-front {
        background: #0f172a;
        border: 1.5px solid rgba(255, 255, 255, 0.22);
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(8, 12, 36, 0.95) 0%, rgba(8, 12, 36, 0.45) 50%, rgba(0, 0, 0, 0.6) 100%);
        }

        .card-top-bar {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;

          .badge-num {
            font: 800 0.74rem monospace;
            color: #c5ff3d;
          }

          .badge-label {
            font: 800 0.54rem var(--font-head);
            letter-spacing: 0.08em;
            background: rgba(255, 255, 255, 0.16);
            color: #ffffff;
            padding: 3px 6px;
            border-radius: 6px;
          }
        }

        .card-foot {
          position: relative;
          z-index: 2;
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 8px;

          .foot-info {
            flex: 1;
            min-width: 0;
          }

          .foot-title {
            font: 800 0.82rem var(--font-head);
            color: #ffffff;
            line-height: 1.15;
            margin: 0 0 2px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .foot-sub {
            font: 600 0.62rem var(--font-head);
            color: #c5ff3d;
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* Prominent Clickable Arrow */
          .card-arrow-btn {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #c5ff3d;
            color: #101947;
            border: 0;
            display: grid;
            place-items: center;
            font-weight: 900;
            cursor: pointer;
            flex-shrink: 0;
            box-shadow: 0 4px 10px rgba(197, 255, 61, 0.4);
            transition: transform 0.2s, background-color 0.2s;

            .arrow-ico {
              font-size: 0.95rem;
              line-height: 1;
            }

            &:hover {
              transform: scale(1.15);
              background: #ffffff;
            }
          }
        }
      }

      /* Back Face */
      .card-back {
        background: #101947;
        border: 1.5px solid #2939d9;
        transform: rotateY(180deg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 14px 12px;
        text-align: center;

        .back-badge {
          font: 800 0.54rem var(--font-head);
          letter-spacing: 0.08em;
          color: #c5ff3d;
          background: rgba(41, 57, 217, 0.4);
          padding: 3px 6px;
          border-radius: 6px;
          margin-bottom: 4px;
          display: inline-block;
        }

        .back-title {
          font: 800 0.84rem var(--font-head);
          color: #ffffff;
          line-height: 1.15;
          margin: 0 0 2px 0;
        }

        .back-sub {
          font: 600 0.66rem var(--font-head);
          color: #94a3b8;
          margin: 0 0 8px 0;
        }

        .back-specs-pill {
          font: 700 0.58rem monospace;
          color: #38bdf8;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 6px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .back-tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: center;
          margin-bottom: 8px;

          .b-tag {
            font: 600 0.54rem monospace;
            padding: 2px 5px;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border-radius: 4px;
          }
        }

        /* Full Navigation Button on Back Face */
        .back-jump-btn {
          width: 100%;
          background: #c5ff3d;
          color: #101947;
          border: 0;
          border-radius: 10px;
          padding: 7px 6px;
          font: 800 0.62rem var(--font-head);
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;

          .arrow-bounce {
            font-size: 0.85rem;
            font-weight: 900;
          }

          &:hover {
            background: #ffffff;
            transform: translateY(-2px);
          }
        }
      }

      /* Floating Scroll Pill */
      .morph-scroll-pill {
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(16, 25, 71, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(8px);
        padding: 5px 16px;
        border-radius: 999px;
        font: 700 0.68rem var(--font-head);
        letter-spacing: 0.05em;
        color: #ffffff;
        z-index: 20;
        pointer-events: none;
      }

      @media (max-width: 768px) {
        .morph-container {
          height: 480px;
        }
        .flip-card-wrapper {
          width: 115px;
          height: 165px;
        }
        .intro-title {
          font-size: 1.45rem;
        }
        .arc-title {
          font-size: 1.2rem;
        }
      }
    `,
  ],
})
export class ScrollMorphHeroComponent implements OnInit, OnDestroy {
  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  cards = FOUR_SOLUTION_CARDS; // Exactly 4 cards
  introPhase = signal<AnimationPhase>('scatter');
  virtualScroll = signal<number>(0);
  mouseX = signal<number>(0);
  containerWidth = signal<number>(800);
  containerHeight = signal<number>(560);

  private targetScroll = 0;
  private currentScroll = 0;
  private targetMouseX = 0;
  private currentMouseX = 0;

  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private scatterPositions: { x: number; y: number; rotation: number }[] = [];
  private cleanups: (() => void)[] = [];

  // Morph progress: 0 (Circle) -> 1 (Rainbow Arc)
  morphValue = computed(() => {
    const s = this.virtualScroll();
    const p = Math.min(Math.max(s / 550, 0), 1);
    return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
  });

  // Rotation value for scrolling through cards in arc
  rotateValue = computed(() => {
    const s = this.virtualScroll();
    if (s <= 550) return 0;
    const progress = (s - 550) / (MAX_SCROLL - 550);
    return Math.min(Math.max(progress * 360, 0), 360);
  });

  contentOpacity = computed(() => {
    const m = this.morphValue();
    if (m < 0.6) return 0;
    return Math.min((m - 0.6) / 0.4, 1);
  });

  contentY = computed(() => {
    const m = this.morphValue();
    return (1 - Math.min(Math.max((m - 0.6) / 0.4, 0), 1)) * 20;
  });

  constructor(private zone: NgZone) {}

  ngOnInit() {
    // 4 balanced scatter positions across 4 quadrants
    this.scatterPositions = [
      { x: -280, y: -160, rotation: -12 },
      { x: 280, y: -150, rotation: 10 },
      { x: -240, y: 160, rotation: 8 },
      { x: 260, y: 170, rotation: -10 },
    ];

    setTimeout(() => this.introPhase.set('line'), 600);
    setTimeout(() => this.introPhase.set('circle'), 2200);

    this.zone.runOutsideAngular(() => {
      this.setupEventListeners();
      this.startAnimationLoop();
    });
  }

  ngOnDestroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.cleanups.forEach((fn) => fn());
  }

  // Smooth scroll directly to the corresponding card below
  scrollToCard(targetId: string, ev?: Event) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('card-jump-highlight');
      setTimeout(() => el.classList.remove('card-jump-highlight'), 2400);
    }
  }

  private setupEventListeners() {
    const el = this.containerRef.nativeElement;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.zone.run(() => {
          this.containerWidth.set(entry.contentRect.width || 800);
          this.containerHeight.set(entry.contentRect.height || 560);
        });
      }
    });
    this.resizeObserver.observe(el);

    this.containerWidth.set(el.offsetWidth || 800);
    this.containerHeight.set(el.offsetHeight || 560);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.targetScroll = Math.min(Math.max(this.targetScroll + e.deltaY * 0.9, 0), MAX_SCROLL);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    this.cleanups.push(() => el.removeEventListener('wheel', onWheel));

    const onPointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const normalized = (relX - 0.5) * 2;
      this.targetMouseX = normalized * 60;
    };
    el.addEventListener('pointermove', onPointerMove);
    this.cleanups.push(() => el.removeEventListener('pointermove', onPointerMove));

    let startY = 0;
    let startScroll = 0;
    let isDragging = false;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startY = e.clientY;
      startScroll = this.targetScroll;
    };

    const onDragMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      this.targetScroll = Math.min(Math.max(startScroll + deltaY * 2.2, 0), MAX_SCROLL);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onPointerUp);
    this.cleanups.push(() => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onPointerUp);
    });
  }

  private startAnimationLoop() {
    const loop = () => {
      this.currentScroll += (this.targetScroll - this.currentScroll) * 0.12;
      this.currentMouseX += (this.targetMouseX - this.currentMouseX) * 0.1;

      if (Math.abs(this.targetScroll - this.currentScroll) > 0.1 || Math.abs(this.targetMouseX - this.currentMouseX) > 0.1) {
        this.zone.run(() => {
          this.virtualScroll.set(this.currentScroll);
          this.mouseX.set(this.currentMouseX);
        });
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stepScroll(delta: number) {
    this.targetScroll = Math.min(Math.max(this.targetScroll + delta, 0), MAX_SCROLL);
  }

  toggleMorph() {
    if (this.targetScroll > 280) {
      this.targetScroll = 0;
    } else {
      this.targetScroll = 1000;
    }
  }

  getCardTransform(i: number): string {
    const target = this.calculateCardTarget(i);
    return `translate3d(${target.x}px, ${target.y}px, 0px) rotate(${target.rotation}deg) scale(${target.scale})`;
  }

  getCardOpacity(i: number): number {
    return this.calculateCardTarget(i).opacity;
  }

  getCardZIndex(i: number): number {
    const m = this.morphValue();
    if (m < 0.5) return 10 + i;
    // In arc, central cards have higher z-index
    const centerDist = Math.abs(i - (TOTAL_CARDS - 1) / 2);
    return 30 - Math.round(centerDist * 4);
  }

  private calculateCardTarget(i: number): { x: number; y: number; rotation: number; scale: number; opacity: number } {
    const phase = this.introPhase();
    const w = this.containerWidth();
    const h = this.containerHeight();
    const isMobile = w < 768;

    if (phase === 'scatter') {
      const pos = this.scatterPositions[i] || { x: 0, y: 0, rotation: 0 };
      return {
        x: pos.x,
        y: pos.y,
        rotation: pos.rotation,
        scale: 0.8,
        opacity: 0.9,
      };
    }

    if (phase === 'line') {
      const lineSpacing = isMobile ? 120 : 165;
      const totalWidth = (TOTAL_CARDS - 1) * lineSpacing;
      const lineX = i * lineSpacing - totalWidth / 2;
      return {
        x: lineX,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
      };
    }

    // Phase: Circle & Arc Morphing
    const minDim = Math.min(w, h);
    const circleRadius = Math.min(minDim * 0.36, 240);
    // 4 cards placed at 90 deg intervals: 0, 90, 180, 270
    const circleAngle = (i / TOTAL_CARDS) * 360;
    const circleRad = (circleAngle * Math.PI) / 180;

    const circlePos = {
      x: Math.cos(circleRad) * circleRadius,
      y: Math.sin(circleRad) * circleRadius,
      rotation: circleAngle + 90,
      scale: 1,
    };

    // Convex Bottom Rainbow Arc (4 cards)
    const baseRadius = Math.min(w * 0.85, h * 1.4);
    const arcRadius = baseRadius * (isMobile ? 1.2 : 1.05);
    const arcApexY = h * (isMobile ? 0.34 : 0.24);
    const arcCenterY = arcApexY + arcRadius;

    // Spread angle for 4 cards across the bottom
    const spreadAngle = isMobile ? 75 : 90;
    const startAngle = -90 - spreadAngle / 2;
    const step = spreadAngle / (TOTAL_CARDS - 1);

    const scrollProgress = Math.min(Math.max(this.rotateValue() / 360, 0), 1);
    const maxRotation = spreadAngle * 0.5;
    const boundedRotation = -scrollProgress * maxRotation;

    const currentArcAngle = startAngle + i * step + boundedRotation;
    const arcRad = (currentArcAngle * Math.PI) / 180;

    const arcPos = {
      x: Math.cos(arcRad) * arcRadius + this.mouseX(),
      y: Math.sin(arcRad) * arcRadius + arcCenterY,
      rotation: currentArcAngle + 90,
      scale: isMobile ? 1.05 : 1.15,
    };

    const m = this.morphValue();

    return {
      x: lerp(circlePos.x, arcPos.x, m),
      y: lerp(circlePos.y, arcPos.y, m),
      rotation: lerp(circlePos.rotation, arcPos.rotation, m),
      scale: lerp(circlePos.scale, arcPos.scale, m),
      opacity: 1,
    };
  }
}
