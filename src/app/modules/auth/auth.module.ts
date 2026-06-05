import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbToastrModule,
} from '@nebular/theme';

import { RegisterComponent } from './register/register.component';

@Component({
  selector: 'ngx-bf-auth-page',
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
export class AuthPageComponent {
  title = this.route.snapshot.data['title'];
  description = this.route.snapshot.data['description'];

  constructor(private route: ActivatedRoute) {}
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: AuthPageComponent,
    data: {
      title: 'Iniciar sesión',
      description: 'Base de autenticación de BeatFlow montada sobre el shell de ngx-admin.',
    },
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'request-password',
    component: AuthPageComponent,
    data: {
      title: 'Recuperar contraseña',
      description: 'Flujo para solicitar restablecimiento de acceso.',
    },
  },
  {
    path: 'reset-password',
    component: AuthPageComponent,
    data: {
      title: 'Restablecer contraseña',
      description: 'Pantalla base para completar el cambio de contraseña.',
    },
  },
  {
    path: 'logout',
    component: AuthPageComponent,
    data: {
      title: 'Cerrar sesión',
      description: 'Ruta reservada para cerrar la sesión del usuario.',
    },
  },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbFormFieldModule,
    NbInputModule,
    NbIconModule,
    NbButtonModule,
    NbAlertModule,
    NbToastrModule,
  ],
  declarations: [AuthPageComponent, RegisterComponent],
})
export class AuthModule {}
