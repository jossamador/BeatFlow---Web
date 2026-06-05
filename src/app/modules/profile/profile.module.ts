import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule } from '@nebular/theme';

@Component({
  selector: 'ngx-bf-profile-page',
  template: `
    <section class="feature-page">
      <nb-card class="feature-card">
        <nb-card-header>
          <span class="eyebrow">BeatFlow</span>
          <h1>Profile</h1>
        </nb-card-header>
        <nb-card-body>
          <p>Configura tu perfil, foto y preferencias de usuario.</p>
        </nb-card-body>
      </nb-card>
    </section>
  `,
})
export class ProfilePageComponent {}

const routes: Routes = [
  {
    path: '',
    component: ProfilePageComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NbCardModule],
  declarations: [ProfilePageComponent],
})
export class ProfileModule {}
