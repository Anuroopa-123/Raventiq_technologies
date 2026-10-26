import { Component, ElementRef, NgZone, OnDestroy, AfterViewInit, ViewChild, inject } from '@angular/core';
import { SceneService } from './scene.service';

type T = typeof import('three');

/* ---------- the "day" palette: one entry per page section ----------
   Retheme note: this used to be a warm pastel daylight sky (cream/peach/
   blush). Replaced with a deep-space navy palette so the 3D scene reads as
   a premium tech backdrop rather than a candy-coloured illustration -- the
   sections still progress through a subtle colour shift, just within a
   near-black register instead of a bright one. */
// sky gradient (top, bottom) - Electric cobalt, deep navy, warm off-white
const SKY = [
  ['#2939d9', '#182463'], // 01 hero: cobalt
  ['#f8f8f0', '#f2f2e8'], // 02 solutions: warm off-white
  ['#ffffff', '#f8f8f0'], // 03 capabilities
  ['#101947', '#0a0f2e'], // 04 projects: deep navy
  ['#101947', '#182463'], // 05 about: deep navy
  ['#ffffff', '#f8f8f0'], // 06 process
  ['#f8f8f0', '#f2f2e8'], // 07 insights
  ['#2939d9', '#101947'], // 08 contact
];
// orb core colours (top, bottom) -- Neon lime & electric cobalt
const SUN = [
  ['#c5ff3d', '#2939d9'],
  ['#2939d9', '#c5ff3d'],
  ['#3c4df5', '#c5ff3d'],
  ['#c5ff3d', '#101947'],
  ['#c5ff3d', '#2939d9'],
  ['#3c4df5', '#101947'],
  ['#2939d9', '#c5ff3d'],
  ['#c5ff3d', '#2939d9'],
];
// where the sun sits per section: [x, y, size] in -1..1 screen space
const WP_DESKTOP = [
  [0.55, -0.05, 1.0],
  [-0.6, 0.25, 0.75],
  [0.65, 0.45, 0.65],
  [-0.45, 0.3, 0.8],
  [0.55, -0.1, 0.85],
  [-0.5, 0.4, 0.7],
  [0.6, 0.2, 0.75],
  [-0.4, -0.3, 1.0]
];
const WP_MOBILE = [
  [0.4, -0.7, 1.1],
  [0.7, 0.8, 0.6],
  [0.7, 0.8, 0.6],
  [0.7, 0.8, 0.6],
  [0.7, 0.8, 0.6],
  [0.7, 0.8, 0.6],
  [0.7, 0.8, 0.6],
  [0.0, -0.85, 1.1]
];
// metallic and lime accents for floating geometry
const PASTELS = ['#c5ff3d', '#2939d9', '#3c4df5', '#101947', '#d4ff66', '#a5e61a'];
const BURST = ['#c5ff3d', '#2939d9', '#3c4df5', '#ffffff', '#d4ff66', '#101947'];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const css = (c: number[]) => `rgb(${c.map(Math.round).join(',')})`;
const smooth = (t: number) => t * t * (3 - 2 * t);
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const SUN_VERT = /* glsl */ `
uniform float uTime; uniform float uPulse;
varying vec3 vNormal; varying vec3 vView; varying float vN; varying vec3 vPos;
${NOISE}
void main(){
  float n = snoise(position*1.25 + vec3(0.0, uTime*0.35, uTime*0.2));
  float n2 = snoise(position*3.0 - uTime*0.25);
  float d = n*0.16 + n2*0.04;
  d *= (1.0 + uPulse*1.6);
  vec3 p = position + normal*d;
  vN = n; vPos = position;
  vNormal = normalize(normalMatrix*normal);
  vec4 mv = modelViewMatrix*vec4(p,1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix*mv;
}`;
const SUN_FRAG = /* glsl */ `
uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uRim; uniform float uTime;
varying vec3 vNormal; varying vec3 vView; varying float vN; varying vec3 vPos;
void main(){
  vec3 n = normalize(vNormal); vec3 v = normalize(vView);
  float fres = pow(1.0 - max(dot(n,v),0.0), 2.4);
  float g = smoothstep(-0.9, 0.9, vPos.y + vN*0.55 + sin(vPos.x*2.0+uTime*0.6)*0.08);
  vec3 col = mix(uColB, uColA, g);
  col = mix(col, uRim, fres*0.75);
  float h = pow(max(dot(n, normalize(vec3(-0.45,0.65,0.6))),0.0), 16.0);
  col += h*0.4;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

@Component({
  selector: 'app-scene',
  standalone: true,
  template: `<canvas #cv aria-hidden="true"></canvas>`,
  styles: `
    :host { position: fixed; inset: 0; z-index: 0; pointer-events: none; display: block; }
    canvas { width: 100%; height: 100%; display: block; }
  `,
})
export class SceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cv', { static: true }) cv!: ElementRef<HTMLCanvasElement>;
  private svc = inject(SceneService);
  private zone = inject(NgZone);
  private stop: () => void = () => {};

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => this.start());
  }
  ngOnDestroy() { this.stop(); }

  private async start() {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement.style;
    const svc = this.svc;

    /* ---- where each section sits on the page (measured, re-measured on resize) ---- */
    let centers: number[] = [];
    const measure = () => {
      centers = Array.from(document.querySelectorAll<HTMLElement>('[data-sky]')).map((e) => {
        const r = e.getBoundingClientRect();
        return r.top + scrollY + r.height / 2;
      });
    };
    const frac = () => {
      if (!centers.length) return 0;
      const y = scrollY + innerHeight * 0.5;
      if (y <= centers[0]) return 0;
      for (let i = 0; i < centers.length - 1; i++) {
        if (y < centers[i + 1]) return i + (y - centers[i]) / (centers[i + 1] - centers[i]);
      }
      return centers.length - 1;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener('load', measure);

    const skyAt = (f: number, table: string[][]) => {
      const i = Math.min(table.length - 2, Math.floor(f));
      const t = smooth(Math.min(1, Math.max(0, f - i)));
      return [mix(hex(table[i][0]), hex(table[i + 1][0]), t), mix(hex(table[i][1]), hex(table[i + 1][1]), t)];
    };

    /* ---- try to start WebGL; the page works (with the sky gradient) even if it fails ---- */
    let gl: { render: (dt: number, f: number) => void; resize: () => void; dispose: () => void } | null = null;
    try {
      const THREE = await import('three');
      gl = this.initGL(THREE, calm);
    } catch (e) {
      console.warn('3D scene disabled (WebGL unavailable):', e);
      document.body.classList.add('no-webgl');
    }

    let fs = 0;
    let last = performance.now();
    let raf = 0;
    let activeIdx = -1;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fs += (frac() - fs) * (1 - Math.exp(-dt * 6));
      const [top, bot] = skyAt(fs, SKY);
      root.setProperty('--sky-top', css(top));
      root.setProperty('--sky-bot', css(bot));
      const idx = Math.round(fs);
      if (idx !== activeIdx) { activeIdx = idx; this.zone.run(() => svc.active.set(idx)); }
      gl?.render(dt, fs);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => { measure(); gl?.resize(); };
    addEventListener('resize', onResize);
    this.stop = () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      removeEventListener('load', measure);
      ro.disconnect();
      gl?.dispose();
    };
  }

  /* =====================  THREE.JS SCENE  ===================== */
  private initGL(THREE: T, calm: boolean) {
    const svc = this.svc;
    const canvas = this.cv.nativeElement;
    const mobile = innerWidth < 720;
    const speed = calm ? 0.2 : 1;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.75 : 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    let VW = 10, VH = 8.7, isMobile = mobile;

    /* lights: a cool cyan "key light" that follows the orb, plus soft indigo fill
       (was a warm daylight rig -- retinted for the dark premium theme) */
    const sunLight = new THREE.DirectionalLight(0xbfe9ff, 2.0);
    scene.add(sunLight, sunLight.target);
    scene.add(new THREE.HemisphereLight(0x3a5a8c, 0x0a0a16, 0.9));
    scene.add(new THREE.AmbientLight(0x6c7fdb, 0.22));

    /* ---------- the sun ---------- */
    const sun = new THREE.Group();
    scene.add(sun);
    const uniforms = {
      uTime: { value: 0 }, uPulse: { value: 0 },
      uColA: { value: new THREE.Color(SUN[0][0]) }, uColB: { value: new THREE.Color(SUN[0][1]) },
      uRim: { value: new THREE.Color('#d6f6ff') },
    };
    const sunMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, mobile ? 20 : 34),
      new THREE.ShaderMaterial({ uniforms, vertexShader: SUN_VERT, fragmentShader: SUN_FRAG }),
    );
    sun.add(sunMesh);

    // soft glow behind the sun
    const gc = document.createElement('canvas'); gc.width = gc.height = 256;
    const g2 = gc.getContext('2d')!;
    const grd = g2.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,255,255,0.95)'); grd.addColorStop(0.35, 'rgba(255,255,255,0.35)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g2.fillStyle = grd; g2.fillRect(0, 0, 256, 256);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, opacity: 0.75 }));
    glow.scale.setScalar(5.2); glow.position.z = -0.6; glow.renderOrder = -1;
    sun.add(glow);

    // orbit rings with little moons
    const rings: { pivot: InstanceType<T['Group']>; spd: number }[] = [];
    const ringDefs = [
      { r: 1.6, color: '#bdf3ff', tilt: [1.15, 0.2], spd: 0.35, moon: '#3ec8e4' },
      { r: 1.95, color: '#8b7bff', tilt: [0.5, -0.6], spd: -0.25, moon: '#ff2d8a' },
      { r: 2.3, color: '#d6e8ff', tilt: [-0.7, 0.9], spd: 0.18, moon: '#9ad9ec' },
    ];
    for (const d of ringDefs) {
      const pivot = new THREE.Group();
      pivot.rotation.set(d.tilt[0], d.tilt[1], 0);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(d.r, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.7 }));
      const spin = new THREE.Group();
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), new THREE.MeshStandardMaterial({ color: d.moon, roughness: 0.3 }));
      moon.position.set(d.r, 0, 0);
      spin.add(moon);
      pivot.add(ring, spin);
      sun.add(pivot);
      rings.push({ pivot: spin as never, spd: d.spd });
    }

    /* ---------- floating 3D shapes (with depth parallax) ---------- */
    const rand = rng(7);
    const kinds = ['ico', 'octa', 'torus', 'knot', 'box', 'cone', 'dodeca', 'cyl'];
    const mk = (k: string) => {
      switch (k) {
        case 'ico': return new THREE.IcosahedronGeometry(1, 0);
        case 'octa': return new THREE.OctahedronGeometry(1, 0);
        case 'torus': return new THREE.TorusGeometry(0.8, 0.3, 14, 36);
        case 'knot': return new THREE.TorusKnotGeometry(0.6, 0.2, 90, 12);
        case 'box': return new THREE.BoxGeometry(1.3, 1.3, 1.3);
        case 'cone': return new THREE.ConeGeometry(0.9, 1.5, 6);
        case 'dodeca': return new THREE.DodecahedronGeometry(1, 0);
        default: return new THREE.CylinderGeometry(0.7, 0.7, 1.3, 7);
      }
    };
    const shapes = Array.from({ length: mobile ? 9 : 16 }, (_, i) => {
      const z = -4 + rand() * 6.5;
      const side = i % 2 ? 1 : -1;
      const mesh = new THREE.Mesh(
        mk(kinds[i % kinds.length]),
        // low-poly but metallic/glassy (was flat matte pastel) -- faceted
        // gemstone look instead of a toy-block look
        new THREE.MeshStandardMaterial({ color: PASTELS[i % PASTELS.length], roughness: 0.22, metalness: 0.55, flatShading: true }),
      );
      const sc = (0.3 + rand() * 0.38) * (mobile ? 0.7 : 1);
      mesh.scale.setScalar(sc);
      scene.add(mesh);
      return {
        mesh, z,
        nx: mobile ? side * (0.72 + rand() * 0.3) : side * (0.5 + rand() * 0.5),
        ny: rand() * 2 - 1,
        sp: 0.22 + ((z + 4) / 6.5) * 0.55,
        rx: (rand() - 0.5) * 0.9, ry: (rand() - 0.5) * 0.9, ph: rand() * 6.28,
      };
    });

    /* ---------- drifting haze (was bright white cartoon clouds; now a dim,
       translucent nebula wisp so the scene reads as deep space, not sky) ---------- */
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0x2a3a6b, roughness: 1, transparent: true, opacity: mobile ? 0.14 : 0.22 });
    const clouds = Array.from({ length: mobile ? 4 : 7 }, (_, i) => {
      const g = new THREE.Group();
      const puffs = 4 + Math.floor(rand() * 3);
      for (let p = 0; p < puffs; p++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.45 + rand() * 0.35, 20, 16), cloudMat);
        m.position.set((p - puffs / 2) * 0.62, (rand() - 0.4) * 0.28, (rand() - 0.5) * 0.4);
        g.add(m);
      }
      const z = -6 + rand() * 5;
      g.scale.set(mobile ? 0.8 : 1.2, mobile ? 0.6 : 0.9, 1);
      scene.add(g);
      return { g, z, x: rand() * 2 - 1, ny: rand() * 2 - 1, v: 0.08 + rand() * 0.12, sp: 0.1 + rand() * 0.18 };
    });

    /* ---------- pollen / sparkles ---------- */
    const PN = mobile ? 70 : 150;
    const ppos = new Float32Array(PN * 3), pcol = new Float32Array(PN * 3);
    const pc = new THREE.Color();
    for (let i = 0; i < PN; i++) {
      ppos.set([(rand() - 0.5) * 18, (rand() - 0.5) * 12, -3 + rand() * 7], i * 3);
      pc.set(PASTELS[i % PASTELS.length]); pcol.set([pc.r, pc.g, pc.b], i * 3);
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
    pgeo.setAttribute('color', new THREE.BufferAttribute(pcol, 3));
    const pollen = new THREE.Points(pgeo, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false }));
    pollen.frustumCulled = false;
    scene.add(pollen);

    /* ---------- particle burst (fires when the contact form is sent) ---------- */
    const BN = 220;
    const bpos = new Float32Array(BN * 3), bcol = new Float32Array(BN * 3), bvel = new Float32Array(BN * 3);
    const bgeo = new THREE.BufferGeometry();
    bgeo.setAttribute('position', new THREE.BufferAttribute(bpos, 3));
    bgeo.setAttribute('color', new THREE.BufferAttribute(bcol, 3));
    const bmat = new THREE.PointsMaterial({ size: 0.2, vertexColors: true, transparent: true, opacity: 0, depthWrite: false });
    const burst = new THREE.Points(bgeo, bmat);
    burst.frustumCulled = false;
    scene.add(burst);
    let blife = 0;
    const fire = () => {
      for (let i = 0; i < BN; i++) {
        bpos.set([sun.position.x, sun.position.y, sun.position.z + 1], i * 3);
        const a = rand() * Math.PI * 2, b = (rand() - 0.5) * Math.PI, s = 2 + rand() * 6;
        bvel.set([Math.cos(a) * Math.cos(b) * s, Math.sin(b) * s + 1.5, Math.sin(a) * Math.cos(b) * s * 0.5], i * 3);
        pc.set(BURST[i % BURST.length]); bcol.set([pc.r, pc.g, pc.b], i * 3);
      }
      bgeo.attributes['color'].needsUpdate = true;
      blife = 1.8;
    };

    /* ---------- input ---------- */
    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMove = (e: PointerEvent) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = -((e.clientY / innerHeight) * 2 - 1); };
    const onClick = () => svc.pulse(0.6);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('click', onClick, { passive: true });

    const resize = () => {
      const w = innerWidth, h = innerHeight;
      isMobile = w < 720;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      VH = 2 * Math.tan(THREE.MathUtils.degToRad(20)) * 12;
      VW = VH * camera.aspect;
    };
    resize();

    /* ---------- per-frame ---------- */
    const cA = new THREE.Color(), cB = new THREE.Color();
    const hexC = (h: string) => new THREE.Color(h);
    const sunA = SUN.map((p) => hexC(p[0])), sunB = SUN.map((p) => hexC(p[1]));
    let time = 0, ss = scrollY / innerHeight, lastSY = scrollY, vel = 0;
    const R = () => VH * 1.7;

    const render = (dt: number, f: number) => {
      time += dt * speed;
      uniforms.uTime.value = time;
      // sun pulse decays
      uniforms.uPulse.value = svc.pulseV;
      svc.pulseV *= Math.exp(-dt * 2.6);
      if (svc.burstQ > 0) { svc.burstQ = 0; fire(); }

      // scroll speed makes everything spin a bit faster
      vel += (Math.abs(scrollY - lastSY) / Math.max(dt, 0.001) - vel) * 0.1;
      lastSY = scrollY;
      const boost = 1 + Math.min(vel / 1800, 2.5);
      ss += (scrollY / innerHeight - ss) * (1 - Math.exp(-dt * 8));

      mx += (tx - mx) * (1 - Math.exp(-dt * 3));
      my += (ty - my) * (1 - Math.exp(-dt * 3));
      const par = calm ? 0 : 1;
      camera.position.x = mx * 0.5 * par;
      camera.position.y = my * 0.35 * par;
      camera.lookAt(0, 0, 0);

      // sun path: smooth blend between per-section waypoints
      const wp = isMobile ? WP_MOBILE : WP_DESKTOP;
      const i = Math.min(wp.length - 2, Math.floor(f));
      const t = smooth(Math.min(1, Math.max(0, f - i)));
      const w = [0, 1, 2].map((k) => wp[i][k] + (wp[i + 1][k] - wp[i][k]) * t);
      const radius = w[2] * VH * (isMobile ? 0.12 : 0.19) * (1 + svc.pulseV * 0.05);
      sun.position.set(w[0] * VW * 0.5 + mx * 0.25 * par, w[1] * VH * 0.5 + Math.sin(time * 0.8) * 0.12 + my * 0.2 * par, 0);
      sun.scale.setScalar(radius);
      sun.rotation.y += dt * 0.25 * speed + mx * 0.004;
      sun.rotation.x += dt * 0.08 * speed;
      glow.scale.setScalar(5.2 + svc.pulseV * 0.6);
      (glow.material as InstanceType<T['SpriteMaterial']>).color.copy(cA.lerpColors(sunA[i], sunA[i + 1], t));
      uniforms.uColA.value.copy(cA);
      uniforms.uColB.value.lerpColors(sunB[i], sunB[i + 1], t);
      for (const r of rings) r.pivot.rotation.z += dt * r.spd * speed * boost;
      sunLight.position.set(sun.position.x * 1.2, sun.position.y + 3, 8);
      sunLight.target.position.set(0, 0, 0);
      sunLight.color.copy(cB.lerpColors(hexC('#d6f0ff'), hexC('#c7b8ff'), f > 3.3 || f < 0.4 ? 1 : 0.3));

      // shapes: float, rotate, drift up as you scroll (each depth at its own speed)
      const range = R();
      for (const s of shapes) {
        let y = s.ny * VH * 0.5 + ss * s.sp * VH * 0.9;
        y = ((((y + range / 2) % range) + range) % range) - range / 2;
        s.mesh.position.set(
          s.nx * VW * 0.5 * (1 + (4 - s.z) * 0.03) + mx * (s.z + 5) * 0.12 * par,
          y + Math.sin(time * 0.9 + s.ph) * 0.15,
          s.z,
        );
        s.mesh.rotation.x += dt * s.rx * speed * boost;
        s.mesh.rotation.y += dt * s.ry * speed * boost;
      }
      // clouds drift sideways
      for (const c of clouds) {
        c.x += dt * c.v * 0.12 * speed;
        if (c.x > 1.3) c.x = -1.3;
        let y = c.ny * VH * 0.5 + ss * c.sp * VH * 0.5;
        y = ((((y + range / 2) % range) + range) % range) - range / 2;
        c.g.position.set(c.x * VW * 0.6 * (1 + (-c.z) * 0.1), y, c.z);
      }
      pollen.rotation.y += dt * 0.02 * speed;
      pollen.position.y = ss * 0.8;

      // burst
      if (blife > 0) {
        blife -= dt;
        for (let k = 0; k < BN; k++) {
          bvel[k * 3 + 1] -= 3.2 * dt;
          bpos[k * 3] += bvel[k * 3] * dt; bpos[k * 3 + 1] += bvel[k * 3 + 1] * dt; bpos[k * 3 + 2] += bvel[k * 3 + 2] * dt;
        }
        bgeo.attributes['position'].needsUpdate = true;
        bmat.opacity = Math.max(0, Math.min(1, blife));
      }
      renderer.render(scene, camera);
    };

    const dispose = () => {
      removeEventListener('pointermove', onMove);
      removeEventListener('click', onClick);
      scene.traverse((o) => {
        const m = o as InstanceType<T['Mesh']>;
        m.geometry?.dispose?.();
      });
      renderer.dispose();
    };
    return { render, resize, dispose };
  }
}
