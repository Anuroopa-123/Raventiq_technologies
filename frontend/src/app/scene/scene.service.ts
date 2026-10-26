import { Injectable, signal } from '@angular/core';

/** Small bridge between the page (Angular) and the 3D scene (Three.js). */
@Injectable({ providedIn: 'root' })
export class SceneService {
  /** which section (time of day) is in view */
  active = signal(0);
  pulseV = 0;
  burstQ = 0;

  /** make the sun wobble (e.g. while typing) */
  pulse(amount = 0.5) { this.pulseV = Math.min(2, this.pulseV + amount); }
  /** fire a burst of colourful particles from the sun (e.g. form sent) */
  burst() { this.burstQ++; this.pulse(1.5); }
}
