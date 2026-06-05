import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, Routes } from '@angular/router';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbToastrModule,
  NbToastrService,
} from '@nebular/theme';
import { Subject } from 'rxjs';

import { RegisterComponent } from './register/register.component';

@Component({
  selector: 'ngx-bf-login-page',
  template: `
    <section class="auth-shell">
      <div class="auth-brand">
        <div class="brand-logo">
          <span class="logo-mark">Beat</span><span class="logo-accent">Flow</span>
        </div>
        <p class="brand-tagline">Tu música. Tus tendencias.</p>
        <div class="brand-features">
          <div class="feat-item"><span class="feat-icon">🎵</span> Canciones en tendencia</div>
          <div class="feat-item"><span class="feat-icon">🎤</span> Artistas populares</div>
          <div class="feat-item"><span class="feat-icon">📊</span> Tu analítica musical</div>
        </div>
      </div>

      <div class="auth-card-wrap">
        <div class="auth-card">
          <h1 class="auth-title">Bienvenido de nuevo</h1>
          <p class="auth-sub">Inicia sesión para continuar</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form" novalidate>
            <div class="field-group">
              <label class="field-label">Correo electrónico</label>
              <input
                nbInput
                fullWidth
                formControlName="email"
                type="email"
                placeholder="tu@correo.com"
              />
              <span class="field-error" *ngIf="email.invalid && email.touched">
                <span *ngIf="email.errors?.['required']">El correo es obligatorio.</span>
                <span *ngIf="email.errors?.['email']">Correo inválido.</span>
              </span>
            </div>

            <div class="field-group">
              <label class="field-label">Contraseña</label>
              <div class="password-wrap">
                <input
                  nbInput
                  fullWidth
                  formControlName="password"
                  [type]="showPwd ? 'text' : 'password'"
                  placeholder="Mínimo 6 caracteres"
                />
                <button type="button" class="toggle-pwd" (click)="showPwd = !showPwd">
                  {{ showPwd ? '🙈' : '👁' }}
                </button>
              </div>
              <span class="field-error" *ngIf="password.invalid && password.touched">
                Contraseña obligatoria (mín. 6 caracteres).
              </span>
            </div>

            <button nbButton status="primary" fullWidth type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
            </button>

            <p class="auth-footer-text">
              ¿No tienes cuenta?
              <a routerLink="/auth/register" class="auth-link">Regístrate gratis</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .auth-shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background:
        radial-gradient(ellipse at 10% 80%, rgba(255,77,109,.22), transparent 52%),
        radial-gradient(ellipse at 88% 18%, rgba(124,58,237,.22), transparent 52%),
        #070d1a;
    }

    .auth-brand {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4rem 3rem;
    }

    .brand-logo {
      font-size: 3.5rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      line-height: 1;
    }

    .logo-mark { color: #f8fafc; }
    .logo-accent { color: #ff4d6d; }

    .brand-tagline {
      margin: 1rem 0 2rem;
      font-size: 1.25rem;
      color: rgba(248,250,252,.65);
      line-height: 1.4;
    }

    .brand-features {
      display: grid;
      gap: 0.75rem;
    }

    .feat-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.96rem;
      color: rgba(248,250,252,.7);
    }

    .feat-icon { font-size: 1.2rem; }

    .auth-card-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: rgba(17,28,54,.92);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(148,163,184,.15);
      border-radius: 1.5rem;
      padding: 2.5rem;
    }

    .auth-title {
      margin: 0 0 0.35rem;
      font-size: 1.85rem;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1.1;
    }

    .auth-sub {
      margin: 0 0 2rem;
      color: rgba(148,163,184,.85);
      font-size: 0.95rem;
    }

    .auth-form { display: grid; gap: 1.1rem; }

    .field-group { display: grid; gap: 0.38rem; }

    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(248,250,252,.7);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .password-wrap { position: relative; }

    .toggle-pwd {
      position: absolute;
      right: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
      line-height: 1;
    }

    .field-error {
      font-size: 0.78rem;
      color: #fb7185;
    }

    .auth-footer-text {
      margin: 0.4rem 0 0;
      text-align: center;
      font-size: 0.88rem;
      color: rgba(148,163,184,.8);
    }

    .auth-link {
      color: #ff4d6d;
      font-weight: 700;
      text-decoration: none;
    }

    .auth-link:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .auth-shell { grid-template-columns: 1fr; }
      .auth-brand { display: none; }
    }
  `],
})
export class LoginPageComponent implements OnDestroy {
  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  showPwd = false;
  loading = false;
  private destroy$ = new Subject<void>();

  get email(): AbstractControl { return this.form.get('email')!; }
  get password(): AbstractControl { return this.form.get('password')!; }

  constructor(private router: Router, private toastr: NbToastrService) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      const stored = localStorage.getItem('bf_users');
      const users: Array<{ email: string; password: string; name?: string }> = stored ? JSON.parse(stored) : [];
      const match = users.find((u) => u.email === this.email.value && u.password === this.password.value);
      if (match) {
        localStorage.setItem('bf_session', JSON.stringify({ email: match.email, name: match.name || match.email }));
        this.toastr.success(`¡Bienvenido, ${match.name || match.email}!`, 'Sesión iniciada');
        this.router.navigate(['/dashboard']);
      } else {
        this.toastr.danger('Correo o contraseña incorrectos.', 'Error de acceso');
      }
    }, 700);
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}

@Component({
  selector: 'ngx-bf-auth-page',
  template: `
    <section class="auth-shell">
      <div class="auth-brand">
        <div class="brand-logo">
          <span class="logo-mark">Beat</span><span class="logo-accent">Flow</span>
        </div>
        <p class="brand-tagline">Tu música. Tus tendencias.</p>
      </div>
      <div class="auth-card-wrap">
        <div class="auth-card">
          <h1 class="auth-title">{{ title }}</h1>
          <p class="auth-sub">{{ description }}</p>
          <p class="auth-footer-text" style="margin-top:1.5rem">
            <a routerLink="/auth/login" class="auth-link">← Volver al inicio de sesión</a>
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [`.auth-shell{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:radial-gradient(ellipse at 10% 80%,rgba(255,77,109,.22),transparent 52%),radial-gradient(ellipse at 88% 18%,rgba(124,58,237,.22),transparent 52%),#070d1a}.auth-brand{display:flex;flex-direction:column;justify-content:center;padding:4rem 3rem}.brand-logo{font-size:3.5rem;font-weight:900;letter-spacing:-.02em;line-height:1}.logo-mark{color:#f8fafc}.logo-accent{color:#ff4d6d}.brand-tagline{margin:1rem 0 0;font-size:1.25rem;color:rgba(248,250,252,.65)}.auth-card-wrap{display:flex;align-items:center;justify-content:center;padding:2rem}.auth-card{width:100%;max-width:420px;background:rgba(17,28,54,.92);border:1px solid rgba(148,163,184,.15);border-radius:1.5rem;padding:2.5rem}.auth-title{margin:0 0 .35rem;font-size:1.85rem;font-weight:800;color:#f8fafc}.auth-sub{margin:0;color:rgba(148,163,184,.85)}.auth-footer-text{margin:0;text-align:center;font-size:.88rem;color:rgba(148,163,184,.8)}.auth-link{color:#ff4d6d;font-weight:700;text-decoration:none}@media(max-width:768px){.auth-shell{grid-template-columns:1fr}.auth-brand{display:none}}`],
})
export class AuthPageComponent {
  title = this.route.snapshot.data['title'] || 'BeatFlow';
  description = this.route.snapshot.data['description'] || '';
  constructor(private route: ActivatedRoute) {}
}

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'request-password', component: AuthPageComponent,
    data: { title: 'Recuperar contraseña', description: 'Te enviaremos un enlace para restablecer tu acceso.' } },
  { path: 'reset-password', component: AuthPageComponent,
    data: { title: 'Restablecer contraseña', description: 'Completa el cambio de contraseña.' } },
  { path: 'logout', component: AuthPageComponent,
    data: { title: 'Hasta pronto', description: 'Sesión cerrada correctamente.' } },
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
  declarations: [AuthPageComponent, LoginPageComponent, RegisterComponent],
})
export class AuthModule {}
