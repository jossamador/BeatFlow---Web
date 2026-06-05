import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NbButtonModule, NbCardModule, NbInputModule, NbToastrModule, NbToastrService } from '@nebular/theme';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  favoriteGenre: string;
  avatar: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Usuario BeatFlow',
  email: '',
  bio: '',
  favoriteGenre: '',
  avatar: '',
};

const AVATAR_COLORS = ['#ff4d6d', '#2dd4bf', '#7c3aed', '#f59e0b', '#38bdf8'];
const GENRES = ['Pop', 'Rock', 'Reggaeton', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Latin'];

@Component({
  selector: 'ngx-bf-profile-page',
  template: `
    <section class="page">
      <div class="profile-hero">
        <div class="avatar-wrap">
          <div class="avatar" [style.background]="avatarColor">
            {{ initials }}
          </div>
          <div class="avatar-info">
            <h1>{{ profile.name }}</h1>
            <p>{{ profile.email || 'Sin correo registrado' }}</p>
            <span class="genre-badge" *ngIf="profile.favoriteGenre">{{ profile.favoriteGenre }}</span>
          </div>
        </div>
      </div>

      <div class="profile-grid">
        <nb-card class="edit-card">
          <nb-card-header><h2 class="card-title">Editar perfil</h2></nb-card-header>
          <nb-card-body>
            <form [formGroup]="form" (ngSubmit)="save()" class="edit-form" novalidate>
              <div class="field-group">
                <label class="field-label">Nombre</label>
                <input nbInput fullWidth formControlName="name" placeholder="Tu nombre" />
              </div>
              <div class="field-group">
                <label class="field-label">Correo</label>
                <input nbInput fullWidth formControlName="email" type="email" placeholder="tu@correo.com" [attr.disabled]="true" />
              </div>
              <div class="field-group">
                <label class="field-label">Biografía</label>
                <input nbInput fullWidth formControlName="bio" placeholder="Cuéntanos sobre tu gusto musical..." />
              </div>
              <div class="field-group">
                <label class="field-label">Género favorito</label>
                <div class="genre-selector">
                  <button
                    type="button"
                    class="genre-btn"
                    *ngFor="let g of genres"
                    [class.active]="form.value.favoriteGenre === g"
                    (click)="form.patchValue({ favoriteGenre: g })"
                  >{{ g }}</button>
                </div>
              </div>
              <button nbButton status="primary" type="submit">Guardar cambios</button>
            </form>
          </nb-card-body>
        </nb-card>

        <nb-card class="stats-card">
          <nb-card-header><h2 class="card-title">Tu actividad</h2></nb-card-header>
          <nb-card-body>
            <div class="stat-list">
              <div class="stat-row" *ngFor="let s of activityStats">
                <span class="stat-icon">{{ s.icon }}</span>
                <div class="stat-copy">
                  <strong>{{ s.value }}</strong>
                  <small>{{ s.label }}</small>
                </div>
              </div>
            </div>
          </nb-card-body>
        </nb-card>
      </div>
    </section>
  `,
  styles: [`
    .page {
      padding: 2rem;
      max-width: 1080px;
      margin: 0 auto;
      display: grid;
      gap: 1.5rem;
    }

    .profile-hero {
      background:
        radial-gradient(ellipse at 80% 50%, rgba(124,58,237,.22), transparent 55%),
        radial-gradient(ellipse at 20% 50%, rgba(255,77,109,.18), transparent 55%),
        rgba(17,28,54,.7);
      border: 1px solid rgba(148,163,184,.12);
      border-radius: 1.25rem;
      padding: 2rem;
    }

    .avatar-wrap {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .avatar {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
      border: 3px solid rgba(255,255,255,.15);
    }

    .avatar-info h1 { margin: 0; font-size: 1.8rem; font-weight: 800; color: #f8fafc; }
    .avatar-info p { margin: 0.3rem 0 0; color: rgba(148,163,184,.8); font-size: 0.9rem; }

    .genre-badge {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      background: rgba(255,77,109,.18);
      color: #ff4d6d;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 1rem;
    }

    .card-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: #f8fafc; }

    .edit-form { display: grid; gap: 1rem; }
    .field-group { display: grid; gap: 0.35rem; }
    .field-label { font-size: 0.78rem; font-weight: 600; color: rgba(248,250,252,.7); text-transform: uppercase; letter-spacing: 0.05em; }

    .genre-selector { display: flex; flex-wrap: wrap; gap: 0.4rem; }

    .genre-btn {
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,.25);
      background: transparent;
      color: rgba(248,250,252,.65);
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .genre-btn.active {
      background: rgba(255,77,109,.18);
      border-color: #ff4d6d;
      color: #ff4d6d;
      font-weight: 700;
    }

    .genre-btn:hover:not(.active) {
      border-color: rgba(148,163,184,.5);
      color: #f8fafc;
    }

    .stat-list { display: grid; gap: 1rem; }

    .stat-row {
      display: grid;
      grid-template-columns: 2.5rem 1fr;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-icon {
      font-size: 1.5rem;
      text-align: center;
    }

    .stat-copy { display: grid; gap: 0.1rem; }
    .stat-copy strong { color: #f8fafc; font-size: 1.1rem; }
    .stat-copy small { color: rgba(148,163,184,.7); font-size: 0.8rem; }

    @media (max-width: 768px) {
      .profile-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ProfilePageComponent implements OnInit {
  profile: UserProfile = { ...DEFAULT_PROFILE };
  genres = GENRES;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    bio: new FormControl('', { nonNullable: true }),
    favoriteGenre: new FormControl('', { nonNullable: true }),
  });

  activityStats = [
    { icon: '🎵', value: '—', label: 'Canciones escuchadas' },
    { icon: '🎤', value: '—', label: 'Artistas seguidos' },
    { icon: '📋', value: '0', label: 'Playlists creadas' },
    { icon: '⭐', value: '—', label: 'Favoritos guardados' },
  ];

  get initials(): string {
    return (this.profile.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  get avatarColor(): string {
    const idx = this.profile.name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  }

  constructor(private toastr: NbToastrService) {}

  ngOnInit(): void {
    const session = localStorage.getItem('bf_session');
    const storedProfile = localStorage.getItem('bf_profile');
    if (session) {
      const { email, name } = JSON.parse(session);
      this.profile.email = email || '';
      this.profile.name = name || DEFAULT_PROFILE.name;
    }
    if (storedProfile) {
      this.profile = { ...this.profile, ...JSON.parse(storedProfile) };
    }
    const playlists = localStorage.getItem('bf_playlists');
    if (playlists) {
      this.activityStats[2].value = String(JSON.parse(playlists).length);
    }
    this.form.patchValue({
      name: this.profile.name,
      email: this.profile.email,
      bio: this.profile.bio,
      favoriteGenre: this.profile.favoriteGenre,
    });
  }

  save(): void {
    this.profile = {
      ...this.profile,
      name: this.form.value.name || this.profile.name,
      bio: this.form.value.bio || '',
      favoriteGenre: this.form.value.favoriteGenre || '',
    };
    localStorage.setItem('bf_profile', JSON.stringify(this.profile));
    const session = localStorage.getItem('bf_session');
    if (session) {
      const s = JSON.parse(session);
      localStorage.setItem('bf_session', JSON.stringify({ ...s, name: this.profile.name }));
    }
    this.toastr.success('Perfil actualizado correctamente.', 'BeatFlow');
  }
}

const routes: Routes = [{ path: '', component: ProfilePageComponent }];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes), NbCardModule, NbButtonModule, NbInputModule, NbToastrModule],
  declarations: [ProfilePageComponent],
})
export class ProfileModule {}

