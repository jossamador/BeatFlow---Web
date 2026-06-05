import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule } from '@nebular/theme';
import { Subject, of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { BeatflowArtist, BeatflowExploreService } from '../../@core/services';

interface StatBar {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface WeekDay {
  day: string;
  minutes: number;
}

interface TopArtist {
  name: string;
  genre: string;
  plays: number;
  color: string;
}

const ARTIST_COLORS = ['#ff2d4b', '#ff6b1a', '#00d4ff', '#ffab00', '#7c3aed'];

@Component({
  selector: 'ngx-bf-analytics-page',
  template: `
    <section class="page">

      <div class="page-hero">
        <span class="eyebrow">Analítica</span>
        <h1>Tu actividad musical</h1>
        <p>Resumen de tus hábitos de escucha esta semana.</p>
      </div>

      <div class="kpi-row">
        <div class="kpi-card" *ngFor="let k of kpis">
          <span class="kpi-icon">{{ k.icon }}</span>
          <strong class="kpi-value">{{ k.value }}</strong>
          <small class="kpi-label">{{ k.label }}</small>
        </div>
      </div>

      <div class="charts-grid">
        <nb-card>
          <nb-card-header><h2 class="card-title">Géneros favoritos</h2></nb-card-header>
          <nb-card-body>
            <div class="bar-chart">
              <div class="bar-row" *ngFor="let b of genreBars">
                <span class="bar-label">{{ b.label }}</span>
                <div class="bar-track">
                  <div class="bar-fill" [style.width]="(b.value / b.max * 100) + '%'" [style.background]="b.color"></div>
                </div>
                <span class="bar-val">{{ b.value }}%</span>
              </div>
            </div>
          </nb-card-body>
        </nb-card>

        <nb-card>
          <nb-card-header><h2 class="card-title">Minutos escuchados por día</h2></nb-card-header>
          <nb-card-body>
            <div class="week-chart">
              <div class="week-col" *ngFor="let w of weekActivity">
                <div class="week-bar-wrap">
                  <div class="week-bar" [style.height]="(w.minutes / maxMinutes * 100) + '%'"></div>
                </div>
                <span class="week-day">{{ w.day }}</span>
                <span class="week-min">{{ w.minutes }}m</span>
              </div>
            </div>
          </nb-card-body>
        </nb-card>
      </div>

      <nb-card class="top-card">
        <nb-card-header>
          <div class="section-head">
            <h2 class="card-title">Artistas más escuchados</h2>
            <span class="badge-live">Esta semana</span>
          </div>
        </nb-card-header>
        <nb-card-body>
          <div class="top-list">
            <div class="top-row" *ngFor="let a of topArtists; let i = index">
              <span class="top-rank">#{{ i + 1 }}</span>
              <div class="top-avatar" [style.background]="a.color">{{ a.name[0] }}</div>
              <div class="top-info">
                <strong>{{ a.name }}</strong>
                <small>{{ a.genre }}</small>
              </div>
              <div class="top-bar-mini">
                <div class="top-bar-fill" [style.width]="(a.plays / maxArtistPlays * 100) + '%'" [style.background]="a.color"></div>
              </div>
              <span class="top-plays">{{ a.plays }} plays</span>
            </div>
          </div>
        </nb-card-body>
      </nb-card>

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

    .page-hero {}
    .eyebrow { display: block; font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: #ff6b1a; margin-bottom: 0.4rem; }
    h1 { margin: 0; font-size: 2.2rem; font-weight: 800; color: #f8fafc; }
    h1 + p { margin: 0.4rem 0 0; color: rgba(148,163,184,.8); font-size: 0.95rem; }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .kpi-card {
      background: rgba(7,8,15,0.7);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 1rem;
      padding: 1.25rem;
      display: grid;
      gap: 0.3rem;
      align-content: center;
    }

    .kpi-icon { font-size: 1.6rem; }
    .kpi-value { font-size: 1.5rem; font-weight: 800; color: #f0f4ff; }
    .kpi-label { font-size: 0.78rem; color: rgba(240,244,255,.6); text-transform: uppercase; letter-spacing: 0.05em; }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .card-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: #f8fafc; }

    .bar-chart { display: grid; gap: 0.85rem; }

    .bar-row {
      display: grid;
      grid-template-columns: 6rem 1fr 3rem;
      align-items: center;
      gap: 0.75rem;
    }

    .bar-label { font-size: 0.82rem; color: rgba(248,250,252,.75); }

    .bar-track {
      height: 8px;
      border-radius: 99px;
      background: rgba(255,255,255,0.07);
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.6s cubic-bezier(.4,0,.2,1);
    }

    .bar-val { font-size: 0.8rem; color: rgba(148,163,184,.65); text-align: right; }

    .week-chart {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
      height: 180px;
      align-items: end;
    }

    .week-col {
      display: grid;
      grid-template-rows: 1fr auto auto;
      align-items: end;
      text-align: center;
      height: 100%;
      gap: 0.3rem;
    }

    .week-bar-wrap {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      height: 100%;
    }

    .week-bar {
      width: 60%;
      border-radius: 4px 4px 0 0;
      background: linear-gradient(180deg, #ff2d4b, #ff6b1a);
      min-height: 4px;
      transition: height 0.5s cubic-bezier(.4,0,.2,1);
    }

    .week-day { font-size: 0.72rem; color: rgba(148,163,184,.6); }
    .week-min { font-size: 0.68rem; color: rgba(148,163,184,.5); }

    .section-head { display: flex; align-items: center; justify-content: space-between; }
    .badge-live { padding: 0.2rem 0.6rem; border-radius: 999px; background: rgba(255,107,26,.12); color: #ff6b1a; font-size: 0.72rem; font-weight: 700; }

    .top-list { display: grid; gap: 0.75rem; }

    .top-row {
      display: grid;
      grid-template-columns: 2.5rem 2.5rem 1fr 8rem 4.5rem;
      align-items: center;
      gap: 0.75rem;
    }

    .top-rank { font-size: 0.9rem; font-weight: 800; color: #ff4d6d; text-align: center; }

    .top-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 800;
      color: white;
    }

    .top-info { min-width: 0; }
    .top-info strong { display: block; font-size: 0.9rem; color: #f0f4ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top-info small { font-size: 0.78rem; color: rgba(240,244,255,.55); }

    .top-bar-mini {
      height: 6px;
      border-radius: 99px;
      background: rgba(148,163,184,.1);
      overflow: hidden;
    }

    .top-bar-fill { height: 100%; border-radius: 99px; }

    .top-plays { font-size: 0.8rem; color: rgba(148,163,184,.65); text-align: right; white-space: nowrap; }

    @media (max-width: 768px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .charts-grid { grid-template-columns: 1fr; }
      .top-row { grid-template-columns: 2rem 2.5rem 1fr 3rem; }
      .top-bar-mini { display: none; }
    }
  `],
})
export class AnalyticsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  kpis = [
    { icon: '⏱', value: '4h 32m', label: 'Tiempo esta semana' },
    { icon: '🎵', value: '87', label: 'Canciones escuchadas' },
    { icon: '🎤', value: '23', label: 'Artistas únicos' },
    { icon: '🔥', value: '5', label: 'Racha de días' },
  ];

  genreBars: StatBar[] = [
    { label: 'Reggaeton', value: 34, max: 100, color: '#ff2d4b' },
    { label: 'Pop', value: 22, max: 100, color: '#ff6b1a' },
    { label: 'Hip-Hop', value: 18, max: 100, color: '#00d4ff' },
    { label: 'Electronic', value: 14, max: 100, color: '#ffab00' },
    { label: 'R&B', value: 12, max: 100, color: '#ff6b1a' },
  ];

  weekActivity: WeekDay[] = [
    { day: 'Lun', minutes: 38 },
    { day: 'Mar', minutes: 72 },
    { day: 'Mié', minutes: 55 },
    { day: 'Jue', minutes: 90 },
    { day: 'Vie', minutes: 120 },
    { day: 'Sáb', minutes: 65 },
    { day: 'Dom', minutes: 32 },
  ];

  get maxMinutes(): number {
    return Math.max(...this.weekActivity.map((w) => w.minutes));
  }

  get maxArtistPlays(): number {
    return Math.max(...this.topArtists.map((artist) => artist.plays), 1);
  }

  topArtists: TopArtist[] = [
    { name: 'Bad Bunny', genre: 'Reggaeton', plays: 58, color: '#ff2d4b' },
    { name: 'The Weeknd', genre: 'R&B / Pop', plays: 47, color: '#ff6b1a' },
    { name: 'Kendrick Lamar', genre: 'Hip-Hop', plays: 39, color: '#00d4ff' },
    { name: 'Karol G', genre: 'Reggaeton', plays: 33, color: '#ffab00' },
    { name: 'Drake', genre: 'Hip-Hop', plays: 28, color: '#ff6b1a' },
  ];

  constructor(private beatflowExploreService: BeatflowExploreService) {}

  ngOnInit(): void {
    this.beatflowExploreService.getTopArtists(5)
      .pipe(
        map((artists) => artists.map((artist, index) => this.mapTopArtist(artist, index))),
        catchError(() => of(this.topArtists)),
        takeUntil(this.destroy$),
      )
      .subscribe((artists) => {
        this.topArtists = artists;
        this.kpis[2].value = String(artists.length);
      });

    this.beatflowExploreService.getTrendingTracks(25)
      .pipe(
        catchError(() => of([])),
        takeUntil(this.destroy$),
      )
      .subscribe((tracks) => {
        if (tracks.length) {
          this.kpis[1].value = String(tracks.length);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mapTopArtist(artist: BeatflowArtist, index: number): TopArtist {
    return {
      name: artist.name,
      genre: 'Tendencia global',
      plays: Math.max(Math.round((Number(artist.playcount) || Number(artist.listeners) || 0) / 1000000), 1),
      color: ARTIST_COLORS[index % ARTIST_COLORS.length],
    };
  }
}

const routes: Routes = [{ path: '', component: AnalyticsPageComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NbCardModule],
  declarations: [AnalyticsPageComponent],
})
export class AnalyticsModule {}
