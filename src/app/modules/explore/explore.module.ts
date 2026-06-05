import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule } from '@nebular/theme';

@Component({
  selector: 'ngx-bf-explore-page',
  template: `
    <section class="feature-page">
      <nb-card class="feature-card">
        <nb-card-header>
          <span class="eyebrow">BeatFlow</span>
          <h1>Explore</h1>
        </nb-card-header>
        <nb-card-body>
          <p>Descubrimiento musical por género, tendencia y estado de ánimo.</p>
        </nb-card-body>
      </nb-card>
    </section>
  `,
})
export class ExplorePageComponent {}

const routes: Routes = [
  {
    path: '',
    component: ExplorePageComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NbCardModule],
  declarations: [ExplorePageComponent],
})
export class ExploreModule {}
