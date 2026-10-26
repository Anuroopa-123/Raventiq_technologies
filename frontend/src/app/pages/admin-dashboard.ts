import { Component, inject } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { PosterManagerComponent } from '../shared/poster-manager';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [PosterManagerComponent],
  template: `
    <div class="dash">
      <div class="head">
        <span class="eyebrow">Admin dashboard</span>
        <h1>Hi {{ auth.user()?.name }} 👋</h1>
        <p>Add the posters for your workshops and events here -- they show up in the "Updates" section of the website right away.</p>
      </div>
      <section class="block">
        <h2>🖼️ Posters</h2>
        <app-poster-manager />
      </section>
    </div>
  `,
  styleUrl: './dashboard.scss',
})
export class AdminDashboardPage {
  auth = inject(AuthService);
}
