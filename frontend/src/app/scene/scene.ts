import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';

/**
 * Full-page WebGL background (three.js, loaded lazily).
 * - A retro "sunrise" sphere with orbiting rings that docks to the corner as you scroll
 * - ~20 candy-coloured low-poly shapes floating in depth; the camera travels down through them as you scroll
 * - Mouse parallax, scroll-velocity spin, click a shape to make it pop
 */
@Component({
  selector: 'app-scene',
  standalone: true,
  template: `<canvas #cv aria-hidden="true"></canvas>`,
  styles: `:host { position: fixed; inset: 0; z-index: 0; pointer-events: none; } canvas { width: 100%; height: 100%; display: block; }`,
})
export class SceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cv', { static: true }) cv!: ElementRef<HTMLCanvasElement>;
  private zone = inject(NgZone);
  private stop?: () => void;
  private dead = false;

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      import('three')
        .then(T => { if (!this.dead) this.stop = this.start(T); })
        .catch(() => document.body.classList.add('no-webgl'));
    });
  }
  ngOnDestroy() { this.dead = true; this.stop?.(); }

  private start(T: typeof import('three')): () => void {
    const canvas = this.cv.nativeElement;
    let renderer: import('three').WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      document.body.classList.add('no-webgl');
      return () => {};
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new T.Scene();
    const FOV = 45, CAM_Z = 14, WORLD_H = 52;
    const camera = new T.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    // lights
    scene.add(new T.HemisphereLight(0xfff0dd, 0xc9bcff, 1.6));
    const key = new T.DirectionalLight(0xffffff, 2.6); key.position.set(4, 7, 9); scene.add(key);
    const warm = new T.PointLight(0xff8a66, 40, 30); warm.position.set(-7, 0, 5); scene.add(warm);
    const cool = new T.PointLight(0x7fe3ff, 30, 30); cool.position.set(8, -3, 4); scene.add(cool);

    const PALETTE = [0xff6a55, 0xffc233, 0x2fd0b5, 0x8b7bff, 0xff8cb9, 0x4cc3ff];
    let seed = 7;
    const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

    // ---- the sun ----
    const sun = new T.Group();
    scene.add(sun);
    const sunMat = new T.ShaderMaterial({
      uniforms: { uA: { value: new T.Color(0xffd23f) }, uB: { value: new T.Color(0xff5e62) } },
      vertexShader: `varying vec3 vN; varying float vY; void main(){ vN=normalize(normalMatrix*normal); vY=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: `uniform vec3 uA; uniform vec3 uB; varying vec3 vN; varying float vY;
        void main(){
          if (vY < 0.18) { float d=(0.18-vY)/1.18; if (fract(vY*7.0) < d*0.85) discard; }
          vec3 c = mix(uB, uA, smoothstep(-1.0, 1.0, vY));
          float f = pow(1.0 - max(dot(vN, vec3(0.0,0.0,1.0)), 0.0), 2.4);
          c += f * vec3(1.0, 0.92, 0.7) * 0.55;
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    const sunBall = new T.Mesh(new T.SphereGeometry(1, 48, 32), sunMat);
    sun.add(sunBall);
    const rings: import('three').Mesh[] = [];
    [[1.75, 0x2fd0b5, 0.4], [2.25, 0x8b7bff, -0.7], [2.8, 0xff8cb9, 1.1]].forEach(([r, col, tilt], i) => {
      const ring = new T.Mesh(new T.TorusGeometry(r as number, 0.02, 8, 120), new T.MeshBasicMaterial({ color: col as number }));
      ring.rotation.x = Math.PI / 2 + (tilt as number) * 0.6; ring.rotation.y = (tilt as number);
      const moon = new T.Mesh(new T.SphereGeometry(0.11 + i * 0.03, 16, 12), new T.MeshStandardMaterial({ color: col as number, roughness: 0.3 }));
      moon.position.set(r as number, 0, 0); ring.add(moon);
      sun.add(ring); rings.push(ring);
    });

    // ---- floating candy shapes ----
    const geos = [
      () => new T.IcosahedronGeometry(0.7, 0), () => new T.OctahedronGeometry(0.75, 0),
      () => new T.TorusGeometry(0.5, 0.2, 12, 28), () => new T.TorusKnotGeometry(0.42, 0.15, 80, 10),
      () => new T.ConeGeometry(0.55, 1.1, 5), () => new T.DodecahedronGeometry(0.62, 0),
      () => new T.BoxGeometry(0.9, 0.9, 0.9), () => new T.CapsuleGeometry(0.28, 0.7, 6, 12),
    ];
    type Item = { mesh: import('three').Mesh; nx: number; y: number; z: number; sc: number; spin: [number, number]; ph: number; sp: number; pulse: number };
    const items: Item[] = [];
    const COUNT = coarse ? 14 : 22;
    for (let i = 0; i < COUNT; i++) {
      const mat = new T.MeshStandardMaterial({ color: PALETTE[i % PALETTE.length], roughness: 0.32, metalness: 0.08, flatShading: i % 3 !== 0 });
      const mesh = new T.Mesh(geos[i % geos.length](), mat);
      const side = i % 2 === 0 ? -1 : 1;
      const it: Item = {
        mesh, nx: side * (0.55 + rnd() * 0.55), y: 1.5 - (i / COUNT) * (WORLD_H + 3) + (rnd() - 0.5) * 2,
        z: -4 + rnd() * 7, sc: 0.55 + rnd() * 0.75, spin: [0.2 + rnd() * 0.5, 0.2 + rnd() * 0.5], ph: rnd() * 6.28, sp: 0.5 + rnd() * 0.7, pulse: 0,
      };
      mesh.rotation.set(rnd() * 3, rnd() * 3, 0);
      scene.add(mesh); items.push(it);
    }
    // dust
    const dustN = coarse ? 120 : 260;
    const dp = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) { dp[i * 3] = (rnd() - 0.5) * 30; dp[i * 3 + 1] = 4 - rnd() * (WORLD_H + 8); dp[i * 3 + 2] = -6 + rnd() * 10; }
    const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dp, 3));
    const dust = new T.Points(dg, new T.PointsMaterial({ color: 0xff8a66, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(dust);

    // ---- state ----
    let aspect = 1, halfH0 = 1, halfW0 = 1, W = 1, H = 1;
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H, false);
      aspect = W / H; camera.aspect = aspect; camera.updateProjectionMatrix();
      halfH0 = Math.tan((FOV * Math.PI) / 360) * CAM_Z; halfW0 = halfH0 * aspect;
      const narrow = Math.min(1, Math.max(0.55, aspect));
      for (const it of items) {
        const half = Math.tan((FOV * Math.PI) / 360) * (CAM_Z - it.z) * aspect;
        it.mesh.position.x = it.nx * half; it.mesh.userData['base'] = it.sc * narrow;
      }
    };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => { mouse.tx = (e.clientX / W - 0.5) * 2; mouse.ty = (e.clientY / H - 0.5) * 2; };
    const ray = new T.Raycaster(); const ndc = new T.Vector2();
    const onDown = (e: PointerEvent) => {
      ndc.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(items.map(i => i.mesh), false)[0];
      if (hit) { const it = items.find(i => i.mesh === hit.object); if (it) it.pulse = 1; }
      else if (ray.intersectObject(sunBall).length) { sunPulse = 1; }
    };
    let sunPulse = 0;
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    resize();

    const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    const smooth = (x: number) => x * x * (3 - 2 * x);
    const cA1 = new T.Color(0xffd23f), cA2 = new T.Color(0xff8cb9), cB1 = new T.Color(0xff5e62), cB2 = new T.Color(0x8b7bff);

    let progress = 0, lastP = 0, boost = 0, t = 0, raf = 0, last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (!reduce) t += dt;
      const max = document.documentElement.scrollHeight - H;
      const target = max > 0 ? clamp(window.scrollY / max) : 0;
      progress = reduce ? target : progress + (target - progress) * Math.min(1, dt * 5);
      boost = lerp(boost, clamp(Math.abs(progress - lastP) * 90, 0, 5), 0.1); lastP = progress;
      document.documentElement.style.setProperty('--p', progress.toFixed(4));
      mouse.x = lerp(mouse.x, mouse.tx, 0.06); mouse.y = lerp(mouse.y, mouse.ty, 0.06);

      camera.position.set(mouse.x * 0.7, -progress * WORLD_H - mouse.y * 0.4, CAM_Z);
      camera.lookAt(0, camera.position.y, 0);

      // sun: big in the hero, then docks to the top-right corner
      const wide = aspect > 1.05;
      const hero = 1 - smooth(clamp(progress / 0.1));
      const x = lerp(wide ? halfW0 * 0.82 : halfW0 * 0.78, wide ? halfW0 * 0.5 : 0, hero);
      const y = lerp(halfH0 * 0.78, wide ? 0.2 : halfH0 * 0.5, hero);
      const s = lerp(wide ? 0.5 : 0.42, wide ? 1.9 : 1.15, hero) * (1 + sunPulse * 0.25);
      sunPulse *= 0.92;
      sun.position.set(camera.position.x * 0.9 + x, camera.position.y + y, -2);
      sun.scale.setScalar(s);
      sun.rotation.y += dt * 0.25; sun.rotation.x = -0.12 + mouse.y * 0.1;
      rings.forEach((r, i) => { r.rotation.z += dt * (0.35 + i * 0.18) * (i % 2 ? -1 : 1); });
      sunMat.uniforms['uA'].value.copy(cA1).lerp(cA2, progress);
      sunMat.uniforms['uB'].value.copy(cB1).lerp(cB2, progress);

      const spinK = 1 + boost;
      for (const it of items) {
        const m = it.mesh, base = (m.userData['base'] as number) ?? it.sc;
        m.position.y = it.y + Math.sin(t * it.sp + it.ph) * 0.35;
        const pulse = it.pulse; it.pulse *= 0.93;
        m.rotation.x += dt * it.spin[0] * (spinK + pulse * 10);
        m.rotation.y += dt * it.spin[1] * (spinK + pulse * 10);
        m.scale.setScalar(base * (1 + Math.sin(pulse * Math.PI) * 0.45));
      }
      dust.position.x = mouse.x * 0.4;
      dust.rotation.y = t * 0.02;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      scene.traverse(o => {
        const m = o as import('three').Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as import('three').Material | import('three').Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach(x => x.dispose());
      });
      renderer.dispose();
    };
  }
}
