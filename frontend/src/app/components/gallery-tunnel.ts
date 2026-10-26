import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import * as THREE from 'three';

// Curated high-resolution tech-focused imagery
const TECH_IMAGES = [
  // 01: AI Neural Network & Brain Synapses
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
  // 02: High-Density Cloud Infrastructure & Server Racks
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
  // 03: Silicon Microprocessor & Quantum Circuitry
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  // 04: Futuristic Holographic Data Analytics Interface
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
  // 05: Cyber Security Code Stream & Encryption Matrix
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
  // 06: Glowing Neon Tech Waves & Optical Geometry
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  // 07: Quantum Particle Mesh & Multi-agent Simulation
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
  // 08: Robotics & Autonomous Cognitive Perception
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop',
];

const TUNNEL_WIDTH = 2;
const TUNNEL_HEIGHT = 1.8;
const SEGMENT_DEPTH = 1;
const NUM_SEGMENTS = 15;
const LINE_RADIUS = 0.003;
const SCROLL_TO_Z = 0.05;
const CAMERA_CHASE = 0.1;
const FADE_IN = 1;
const FOG_FAR = NUM_SEGMENTS * SEGMENT_DEPTH * 0.95;

@Component({
  selector: 'app-gallery-tunnel',
  standalone: true,
  template: `
    <div
      #frameRef
      class="tunnel-container"
      [class.fullscreen]="isFullscreen()"
      tabindex="0"
      role="region"
      aria-label="3D Tech Tunnel Viewport"
    >
      <!-- Canvas Render Target -->
      <canvas #canvasRef class="tunnel-canvas"></canvas>

      <!-- Minimalist Clean Controls (No text banners or distracting HUD) -->
      <div class="tunnel-header">
        <div class="th-dots">
          <span class="dot dot-r"></span>
          <span class="dot dot-y"></span>
          <span class="dot dot-g"></span>
        </div>
        <div class="th-actions">
          <button
            type="button"
            class="th-fs-btn"
            (click)="toggleFullscreen($event)"
            [attr.aria-label]="isFullscreen() ? 'Exit fullscreen' : 'Expand full tunnel'"
            [title]="isFullscreen() ? 'Exit fullscreen (Esc)' : 'Expand full tunnel'"
          >
            {{ isFullscreen() ? '✕' : '⛶' }}
          </button>
        </div>
      </div>

      <!-- Floating Interactive Cursor Pill (Originkit Specs) -->
      <div #cursorRef class="tunnel-cursor-pill">
        <span>{{ isWarping() ? 'Accelerating...' : 'Hold to Warp' }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        position: relative;
      }

      .tunnel-container {
        position: relative;
        width: 100%;
        height: 520px;
        border-radius: 28px;
        overflow: hidden;
        background: #080c24;
        border: 1.5px solid rgba(255, 255, 255, 0.16);
        box-shadow:
          0 25px 60px rgba(0, 0, 0, 0.6),
          0 0 40px rgba(41, 57, 217, 0.25);
        cursor: crosshair;
        user-select: none;
        outline: none;
        transition:
          box-shadow 0.3s ease,
          border-color 0.3s ease;

        &:hover {
          border-color: rgba(197, 255, 61, 0.5);
          box-shadow:
            0 30px 70px rgba(0, 0, 0, 0.7),
            0 0 50px rgba(197, 255, 61, 0.2);
        }

        &.fullscreen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          border-radius: 0;
          border: 0;
        }
      }

      .tunnel-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }

      /* Clean Top Control Bar */
      .tunnel-header {
        position: absolute;
        top: 16px;
        left: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        pointer-events: none;
        z-index: 10;
      }

      .th-dots {
        display: flex;
        gap: 6px;
        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }
        .dot-r {
          background: #ef4444;
        }
        .dot-y {
          background: #f59e0b;
        }
        .dot-g {
          background: #10b981;
        }
      }

      .th-actions {
        pointer-events: auto;
      }

      .th-fs-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(16, 25, 71, 0.75);
        backdrop-filter: blur(8px);
        color: #ffffff;
        font-size: 0.95rem;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #c5ff3d;
          color: #101947;
          border-color: #c5ff3d;
          transform: scale(1.05);
        }
      }

      /* Floating Interactive Cursor Pill */
      .tunnel-cursor-pill {
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(0%, -100%) scale(1);
        pointer-events: none;
        opacity: 0;
        background: #c5ff3d;
        color: #101947;
        font: 700 0.82rem var(--font-head, sans-serif);
        letter-spacing: 0.02em;
        border-radius: 9999px;
        padding: 8px 18px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        transition:
          transform 0.1s ease,
          opacity 0.2s ease;
        white-space: nowrap;
        user-select: none;
        z-index: 20;
      }

      @media (max-width: 900px) {
        .tunnel-container {
          height: 420px;
        }
      }
    `,
  ],
})
export class GalleryTunnelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('frameRef', { static: true }) frameRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorRef', { static: true }) cursorRef!: ElementRef<HTMLDivElement>;

  private zone = inject(NgZone);

  isFullscreen = signal(false);
  isWarping = signal(false);

  private alive = true;
  private raf = 0;
  private ro?: ResizeObserver;
  private cleanupListeners: (() => void)[] = [];

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.initTunnel();
    });
  }

  ngOnDestroy() {
    this.alive = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.ro) this.ro.disconnect();
    this.cleanupListeners.forEach((cleanup) => cleanup());
  }

  toggleFullscreen(e: Event) {
    e.stopPropagation();
    this.isFullscreen.update((fs) => !fs);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }

  private initTunnel() {
    const frame = this.frameRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const cursor = this.cursorRef.nativeElement;
    if (!frame || !canvas) return;

    const background = '#080c24';
    const lineColor = '#38bdf8';
    const lineOpacity = 0.5;
    const colors = ['#C5FF3D', '#2939D9', '#3C4DF5', '#8B5CF6', '#00E5FF', '#101947', '#FF6A00'];
    const grid = 4;
    const baseSpeed = 1;
    const warpBoost = 10;
    const fade = 100;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const fogNear = Math.min(FOG_FAR * (1 - Math.min(100, Math.max(0, fade)) / 100), FOG_FAR - 0.01);
    scene.fog = new THREE.Fog(new THREE.Color(background), fogNear, FOG_FAR);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(lineColor),
      transparent: true,
      opacity: lineOpacity,
    });

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const fading: THREE.MeshBasicMaterial[] = [];

    let imageIndex = 0;
    let colorIndex = 0;
    let populateIndex = 0;
    let scrollPos = 0;
    let last = 0;
    let pressed = false;

    const hw = TUNNEL_WIDTH / 2;
    const hh = TUNNEL_HEIGHT / 2;

    const cols = Math.max(1, Math.round(grid));
    const rows = Math.max(1, Math.round(grid));
    const colW = TUNNEL_WIDTH / cols;
    const rowH = TUNNEL_HEIGHT / rows;

    const geoFloor = new THREE.PlaneGeometry(colW, SEGMENT_DEPTH);
    const geoWall = new THREE.PlaneGeometry(SEGMENT_DEPTH, rowH);

    const geoTubeZ = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -SEGMENT_DEPTH)),
      1,
      LINE_RADIUS,
      8
    );
    const geoTubeX = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(TUNNEL_WIDTH, 0, 0)),
      1,
      LINE_RADIUS,
      8
    );
    const geoTubeY = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, TUNNEL_HEIGHT, 0)),
      1,
      LINE_RADIUS,
      8
    );

    const colorMats = colors.map(
      (hex) =>
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(hex),
          side: THREE.DoubleSide,
        })
    );

    // High-tech procedural canvas textures (circuits, neural graphs, waveforms, radar)
    const createProceduralTechTexture = (title: string, colorHex: string, type: number) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Deep cyber backdrop
        ctx.fillStyle = '#060a1e';
        ctx.fillRect(0, 0, 512, 512);

        // Tech grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= 512; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 512);
          ctx.stroke();
        }
        for (let y = 0; y <= 512; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();
        }

        // Glowing cyber border
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 3;
        ctx.strokeRect(16, 16, 480, 480);

        // Corner accents
        ctx.fillStyle = colorHex;
        ctx.fillRect(12, 12, 24, 6);
        ctx.fillRect(12, 12, 6, 24);
        ctx.fillRect(476, 12, 24, 6);
        ctx.fillRect(494, 12, 6, 24);
        ctx.fillRect(12, 494, 24, 6);
        ctx.fillRect(12, 476, 6, 24);
        ctx.fillRect(476, 494, 24, 6);
        ctx.fillRect(494, 476, 6, 24);

        if (type === 0) {
          // Neural graph nodes
          const nodes = [
            [120, 180], [256, 120], [392, 180],
            [160, 300], [352, 300], [256, 360]
          ];
          ctx.strokeStyle = 'rgba(197, 255, 61, 0.4)';
          ctx.lineWidth = 2;
          nodes.forEach((n1, i) => {
            nodes.slice(i + 1).forEach((n2) => {
              ctx.beginPath();
              ctx.moveTo(n1[0], n1[1]);
              ctx.lineTo(n2[0], n2[1]);
              ctx.stroke();
            });
          });
          nodes.forEach((n) => {
            ctx.fillStyle = colorHex;
            ctx.beginPath();
            ctx.arc(n[0], n[1], 8, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (type === 1) {
          // Digital Waveform
          ctx.strokeStyle = colorHex;
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let x = 32; x < 480; x += 10) {
            const y = 256 + Math.sin(x * 0.05) * 60 + Math.cos(x * 0.1) * 30;
            if (x === 32) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        } else if (type === 2) {
          // Concentric radar circles
          ctx.strokeStyle = colorHex;
          ctx.lineWidth = 2;
          [50, 100, 150].forEach((r) => {
            ctx.beginPath();
            ctx.arc(256, 256, r, 0, Math.PI * 2);
            ctx.stroke();
          });
          ctx.beginPath();
          ctx.moveTo(256, 100);
          ctx.lineTo(256, 412);
          ctx.moveTo(100, 256);
          ctx.lineTo(412, 256);
          ctx.stroke();
        } else {
          // Microchip circuit trace
          ctx.strokeStyle = colorHex;
          ctx.lineWidth = 2;
          ctx.strokeRect(180, 180, 152, 152);
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(200 + i * 36, 180);
            ctx.lineTo(200 + i * 36, 80);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(200 + i * 36, 332);
            ctx.lineTo(200 + i * 36, 432);
            ctx.stroke();
          }
        }

        // Title text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(title, 256, 440);

        ctx.fillStyle = colorHex;
        ctx.font = '700 16px monospace';
        ctx.fillText('RAVENTIQ TECH CLUSTER', 256, 468);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const techTitles = [
      'NEURAL GRAPH',
      'AGENT SWARM',
      'QUANTUM CORE',
      'EDGE WORKER',
      'VECTOR DB',
      'POLYPHONIC AUDIO',
      'KAFKA EVENT MESH',
      'AI INFERENCE',
    ];

    const imageMats = TECH_IMAGES.map((url, idx) => {
      const proceduralTex = createProceduralTechTexture(
        techTitles[idx % techTitles.length],
        colors[idx % colors.length],
        idx % 4
      );
      const mat = new THREE.MeshBasicMaterial({
        map: proceduralTex,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      });

      loader.load(
        url,
        (tex) => {
          if (!this.alive) {
            tex.dispose();
            return;
          }
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          mat.map = tex;
          mat.needsUpdate = true;
          fading.push(mat);
        },
        undefined,
        () => {
          // Fallback procedural tech texture stays active
        }
      );
      return mat;
    });

    const tube = (geo: THREE.BufferGeometry, x: number, y: number, z = 0) => {
      const m = new THREE.Mesh(geo, lineMaterial);
      m.position.set(x, y, z);
      return m;
    };

    const SLOTS: Array<{
      geo: THREE.BufferGeometry;
      pos: THREE.Vector3;
      rot: THREE.Euler;
    }> = [];
    {
      const z = -SEGMENT_DEPTH / 2;
      for (let i = 0; i < cols; i++) {
        const x = -hw + i * colW + colW / 2;
        SLOTS.push({
          geo: geoFloor,
          pos: new THREE.Vector3(x, -hh, z),
          rot: new THREE.Euler(-Math.PI / 2, 0, 0),
        });
        SLOTS.push({
          geo: geoFloor,
          pos: new THREE.Vector3(x, hh, z),
          rot: new THREE.Euler(Math.PI / 2, 0, 0),
        });
      }
      for (let i = 0; i < rows; i++) {
        const y = -hh + i * rowH + rowH / 2;
        SLOTS.push({
          geo: geoWall,
          pos: new THREE.Vector3(-hw, y, z),
          rot: new THREE.Euler(0, Math.PI / 2, 0),
        });
        SLOTS.push({
          geo: geoWall,
          pos: new THREE.Vector3(hw, y, z),
          rot: new THREE.Euler(0, -Math.PI / 2, 0),
        });
      }
    }

    const populate = (group: THREE.Group) => {
      const takesSlabs = populateIndex % 2 === 0;
      populateIndex++;
      const slabs = group.userData['slabs'] as THREE.Mesh[];

      for (const slab of slabs) {
        if (!takesSlabs || Math.random() > 0.5) {
          slab.visible = false;
          continue;
        }
        slab.visible = true;
        if (Math.random() > 0.5) {
          slab.material = colorMats[(5 * colorIndex) % colorMats.length];
          colorIndex++;
        } else {
          slab.material = imageMats[(3 * imageIndex) % imageMats.length];
          imageIndex++;
        }
      }
    };

    const createSegment = (z: number) => {
      const group = new THREE.Group();
      group.position.z = z;

      for (let i = 0; i <= cols; i++) {
        const x = -hw + i * colW;
        group.add(tube(geoTubeZ, x, -hh));
        group.add(tube(geoTubeZ, x, hh));
      }
      for (let i = 1; i < rows; i++) {
        const y = -hh + i * rowH;
        group.add(tube(geoTubeZ, -hw, y));
        group.add(tube(geoTubeZ, hw, y));
      }
      group.add(tube(geoTubeX, -hw, -hh));
      group.add(tube(geoTubeX, -hw, hh));
      group.add(tube(geoTubeY, -hw, -hh));
      group.add(tube(geoTubeY, hw, -hh));

      const slabs: THREE.Mesh[] = SLOTS.map((slot) => {
        const m = new THREE.Mesh(slot.geo, colorMats[0]);
        m.position.copy(slot.pos);
        m.rotation.copy(slot.rot);
        m.visible = false;
        group.add(m);
        return m;
      });
      group.userData['slabs'] = slabs;

      populate(group);
      return group;
    };

    const segments: THREE.Group[] = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const g = createSegment(-i * SEGMENT_DEPTH);
      scene.add(g);
      segments.push(g);
    }

    const resize = () => {
      const w = Math.max(1, frame.clientWidth);
      const h = Math.max(1, frame.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    this.ro = new ResizeObserver(resize);
    this.ro.observe(frame);
    resize();

    const animate = (now: number) => {
      if (!this.alive) return;
      this.raf = requestAnimationFrame(animate);
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      scrollPos += pressed ? warpBoost : baseSpeed;

      const want = -SCROLL_TO_Z * scrollPos;
      camera.position.z += CAMERA_CHASE * (want - camera.position.z);

      const span = NUM_SEGMENTS * SEGMENT_DEPTH;
      const z = camera.position.z;
      for (const seg of segments) {
        if (seg.position.z > z + SEGMENT_DEPTH) {
          let min = 0;
          for (const s of segments) min = Math.min(min, s.position.z);
          seg.position.z = min - SEGMENT_DEPTH;
          populate(seg);
        } else if (seg.position.z < z - span - SEGMENT_DEPTH) {
          let max = -999999;
          for (const s of segments) max = Math.max(max, s.position.z);
          seg.position.z = max + SEGMENT_DEPTH;
          populate(seg);
        }
      }

      for (let i = fading.length - 1; i >= 0; i--) {
        const m = fading[i];
        m.opacity = Math.min(1, m.opacity + dt / FADE_IN);
        if (m.opacity >= 1) fading.splice(i, 1);
      }

      renderer.render(scene, camera);
    };
    this.raf = requestAnimationFrame(animate);

    const onMove = (e: PointerEvent) => {
      if (!cursor) return;
      const rect = frame.getBoundingClientRect();
      const sx = rect.width > 0 ? frame.clientWidth / rect.width : 1;
      const sy = rect.height > 0 ? frame.clientHeight / rect.height : 1;
      cursor.style.left = `${(e.clientX - rect.left) * sx}px`;
      cursor.style.top = `${(e.clientY - rect.top) * sy}px`;
    };
    const onEnter = () => {
      if (cursor) cursor.style.opacity = '1';
    };
    const onLeave = () => {
      pressed = false;
      this.zone.run(() => this.isWarping.set(false));
      if (cursor) {
        cursor.style.opacity = '0';
        cursor.style.transform = 'translate(0%, -100%) scale(1)';
      }
    };
    const onDown = () => {
      pressed = true;
      this.zone.run(() => this.isWarping.set(true));
      if (cursor) cursor.style.transform = 'translate(0%, -100%) scale(0.85)';
    };
    const onUp = () => {
      pressed = false;
      this.zone.run(() => this.isWarping.set(false));
      if (cursor) cursor.style.transform = 'translate(0%, -100%) scale(1)';
    };

    frame.addEventListener('pointermove', onMove);
    frame.addEventListener('pointerenter', onEnter);
    frame.addEventListener('pointerleave', onLeave);
    frame.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    this.cleanupListeners.push(() => {
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerenter', onEnter);
      frame.removeEventListener('pointerleave', onLeave);
      frame.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);

      geoFloor.dispose();
      geoWall.dispose();
      geoTubeZ.dispose();
      geoTubeX.dispose();
      geoTubeY.dispose();
      for (const m of colorMats) m.dispose();
      for (const m of imageMats) {
        m.map?.dispose();
        m.dispose();
      }
      lineMaterial.dispose();
      renderer.dispose();
    });
  }
}
