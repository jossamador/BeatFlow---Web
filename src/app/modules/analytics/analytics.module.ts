import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule } from '@nebular/theme';

@Component({
  selector: 'ngx-bf-analytics-page',
  template: `
    <section class="feature-page">
      <nb-card class="feature-card">
        <nb-card-header>
          <span class="eyebrow">BeatFlow</span>
          <h1>Analytics</h1>
        </nb-card-header>
        <nb-card-body>
          <p>Panel base para estadísticas musicales y métricas personales.</p>
        </nb-card-body>
      </nb-card>
    </section>
  `,
})
export class AnalyticsPageComponent {}

const routes: Routes = [
  {
    path: '',
    component: AnalyticsPageComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NbCardModule],
  declarations: [AnalyticsPageComponent],
})
export class AnalyticsModule {}
