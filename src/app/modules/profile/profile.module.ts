import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { NbCardModule } from '@nebular/theme';

@Component({
  selector: 'ngx-bf-profile-page',
  template: `
    <section class="feature-page">
      <nb-card class="feature-card">
        <nb-card-header>
          <span class="eyebrow">BeatFlow</span>
          <h1>{{ title }}</h1>
        </nb-card-header>
        <nb-card-body>
          <p>{{ description }}</p>
        </nb-card-body>
      </nb-card>
    </section>
  `,
  styles: [`
    .feature-page {
      padding: 1.5rem;
    }

    .feature-card {
      width: 100%;
      max-width: 960px;
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 0.5rem;
      font-size: 0.75rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--text-hint-color, #8f9bb3);
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      line-height: 1.1;
    }

    p {
      margin: 0;
      color: var(--text-hint-color, #8f9bb3);
      font-size: 1rem;
      line-height: 1.6;
    }
  `],
})
export class ProfilePageComponent {
  title = this.route.snapshot.data['title'];
  description = this.route.snapshot.data['description'];

  constructor(private route: ActivatedRoute) {}
}

const routes: Routes = [
  {
    path: '',
    component: ProfilePageComponent,
    data: {
      title: 'Profile',
      description: 'Base para editar datos de usuario, avatar y configuración personal.',
    },
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NbCardModule],
  declarations: [ProfilePageComponent],
})
export class ProfileModule {
}
