import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule } from '@nebular/theme';

@Component({
  selector: 'ngx-bf-playlists-page',
  template: `
    <section class="feature-page">
      <nb-card class="feature-card">
        <nb-card-header>
          <span class="eyebrow">BeatFlow</span>
          <h1>Playlists</h1>
        </nb-card-header>
        <nb-card-body>
          <p>Administra playlists personalizadas y favoritos musicales.</p>
        </nb-card-body>
      </nb-card>
    </section>
  `,
})
export class PlaylistsPageComponent {}

const routes: Routes = [
  {
    path: '',
    component: PlaylistsPageComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NbCardModule],
  declarations: [PlaylistsPageComponent],
})
export class PlaylistsModule {}
