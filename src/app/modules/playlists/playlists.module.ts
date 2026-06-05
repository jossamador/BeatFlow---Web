import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NbButtonModule, NbCardModule, NbInputModule, NbToastrModule, NbToastrService } from '@nebular/theme';

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  createdAt: string;
  tracks: number;
}

const COVER_COLORS = ['#ff4d6d', '#2dd4bf', '#7c3aed', '#f59e0b', '#38bdf8', '#10b981'];

@Component({
  selector: 'ngx-bf-playlists-page',
  template: `
    <section class="page">

      <div class="page-hero">
        <div>
          <span class="eyebrow">Biblioteca</span>
          <h1>Mis Playlists</h1>
          <p>Organiza tu música favorita en colecciones personalizadas.</p>
        </div>
        <button nbButton status="primary" (click)="showForm = !showForm">
          {{ showForm ? '✕ Cancelar' : '+ Nueva playlist' }}
        </button>
      </div>

      <nb-card class="form-card" *ngIf="showForm">
        <nb-card-header><h2 class="card-title">Crear playlist</h2></nb-card-header>
        <nb-card-body>
          <form [formGroup]="form" (ngSubmit)="createPlaylist()" class="create-form" novalidate>
            <div class="field-group">
              <label class="field-label">Nombre *</label>
              <input nbInput fullWidth formControlName="name" placeholder="Mi playlist de verano..." />
              <span class="field-error" *ngIf="form.get('name')!.invalid && form.get('name')!.touched">
                El nombre es obligatorio (mín. 2 caracteres).
              </span>
            </div>
            <div class="field-group">
              <label class="field-label">Descripción</label>
              <input nbInput fullWidth formControlName="description" placeholder="Describe tu playlist..." />
            </div>
            <div class="form-actions">
              <button nbButton status="primary" type="submit" [disabled]="form.invalid">
                Crear playlist
              </button>
            </div>
          </form>
        </nb-card-body>
      </nb-card>

      <div class="playlists-grid" *ngIf="playlists.length > 0">
        <div class="playlist-card" *ngFor="let pl of playlists">
          <div class="pl-cover" [style.background]="pl.cover">
            <span class="pl-initial">{{ pl.name[0] }}</span>
          </div>
          <div class="pl-info">
            <h3 class="pl-name">{{ pl.name }}</h3>
            <p class="pl-desc">{{ pl.description || 'Sin descripción' }}</p>
            <span class="pl-meta">{{ pl.tracks }} canciones · {{ pl.createdAt }}</span>
          </div>
          <button class="pl-delete" (click)="deletePlaylist(pl.id)" title="Eliminar">✕</button>
        </div>
      </div>

      <div class="empty-state" *ngIf="playlists.length === 0 && !showForm">
        <div class="empty-icon">🎵</div>
        <h3>Aún no tienes playlists</h3>
        <p>Crea tu primera colección musical.</p>
        <button nbButton status="primary" (click)="showForm = true">+ Crear playlist</button>
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

    .page-hero {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .eyebrow {
      display: block;
      font-size: 0.75rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #2dd4bf;
      margin-bottom: 0.4rem;
    }

    h1 { margin: 0; font-size: 2.2rem; font-weight: 800; color: #f8fafc; }
    h1 + p { margin: 0.4rem 0 0; color: rgba(148,163,184,.8); font-size: 0.95rem; }

    .card-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #f8fafc; }

    .create-form { display: grid; gap: 1rem; }
    .field-group { display: grid; gap: 0.35rem; }
    .field-label { font-size: 0.78rem; font-weight: 600; color: rgba(248,250,252,.7); text-transform: uppercase; letter-spacing: 0.05em; }
    .field-error { font-size: 0.76rem; color: #fb7185; }
    .form-actions { display: flex; justify-content: flex-end; }

    .playlists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }

    .playlist-card {
      background: rgba(17,28,54,.85);
      border: 1px solid rgba(148,163,184,.12);
      border-radius: 1rem;
      padding: 1.25rem;
      display: grid;
      grid-template-columns: 3.5rem 1fr auto;
      align-items: center;
      gap: 1rem;
      transition: border-color 0.2s, transform 0.15s;
      cursor: pointer;
    }

    .playlist-card:hover {
      border-color: rgba(255,77,109,.4);
      transform: translateY(-2px);
    }

    .pl-cover {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 0.65rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .pl-initial {
      color: white;
      font-size: 1.4rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .pl-info { min-width: 0; }

    .pl-name {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pl-desc {
      margin: 0.15rem 0 0.3rem;
      font-size: 0.8rem;
      color: rgba(148,163,184,.75);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pl-meta { font-size: 0.72rem; color: rgba(148,163,184,.55); }

    .pl-delete {
      background: none;
      border: none;
      color: rgba(148,163,184,.4);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0.25rem;
      transition: color 0.15s;
      align-self: start;
    }

    .pl-delete:hover { color: #fb7185; }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: rgba(148,163,184,.7);
    }

    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { margin: 0 0 0.5rem; font-size: 1.3rem; color: #f8fafc; }
    .empty-state p { margin: 0 0 1.5rem; }
  `],
})
export class PlaylistsPageComponent implements OnInit {
  playlists: Playlist[] = [];
  showForm = false;

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    description: new FormControl('', { nonNullable: true }),
  });

  constructor(private toastr: NbToastrService) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('bf_playlists');
    this.playlists = stored ? JSON.parse(stored) : [];
  }

  createPlaylist(): void {
    if (this.form.invalid) return;
    const colorIndex = this.playlists.length % COVER_COLORS.length;
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: this.form.value.name!,
      description: this.form.value.description || '',
      cover: COVER_COLORS[colorIndex],
      tracks: 0,
      createdAt: new Date().toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    this.playlists = [newPlaylist, ...this.playlists];
    localStorage.setItem('bf_playlists', JSON.stringify(this.playlists));
    this.toastr.success(`"${newPlaylist.name}" creada.`, 'Playlist lista 🎵');
    this.form.reset();
    this.showForm = false;
  }

  deletePlaylist(id: string): void {
    this.playlists = this.playlists.filter((p) => p.id !== id);
    localStorage.setItem('bf_playlists', JSON.stringify(this.playlists));
    this.toastr.info('Playlist eliminada.', 'BeatFlow');
  }
}

const routes: Routes = [{ path: '', component: PlaylistsPageComponent }];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes), NbCardModule, NbButtonModule, NbInputModule, NbToastrModule],
  declarations: [PlaylistsPageComponent],
})
export class PlaylistsModule {}

