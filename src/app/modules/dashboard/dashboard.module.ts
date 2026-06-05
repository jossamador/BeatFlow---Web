import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule, NbListModule } from '@nebular/theme';
import { Subject, of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { BeatflowExploreService, BeatflowTrack } from '../../@core/services';

interface TrendingTrack {
  rank: number;
  title: string;
  artist: string;
  playcount: number;
  listeners: number;
  cover: string;
  url: string;
}

const FALLBACK_TRACKS: TrendingTrack[] = [
  {
    rank: 1,
    title: 'Midnight Pulse',
    artist: 'BeatFlow Sessions',
    playcount: 128400,
    listeners: 22400,
    cover: 'https://placehold.co/96x96/ff4d6d/ffffff?text=B',
    url: '#',
  },
  {
    rank: 2,
    title: 'Neon Lights',
    artist: 'BeatFlow Sessions',
    playcount: 113900,
    listeners: 18840,
    cover: 'https://placehold.co/96x96/2dd4bf/0f172a?text=F',
    url: '#',
  },
  {
    rank: 3,
    title: 'Skyline Dreams',
    artist: 'BeatFlow Sessions',
    playcount: 98750,
    listeners: 17320,
    cover: 'https://placehold.co/96x96/7c3aed/ffffff?text=W',
    url: '#',
  },
];

@Component({
  selector: 'ngx-bf-dashboard-page',
  template: `
    <section class="feature-page">
      <nb-card class="feature-card hero-card">
        <nb-card-header>
          <div class="hero-grid">
            <div>
              <span class="eyebrow">BeatFlow</span>
              <h1>{{ title }}</h1>
              <p>{{ description }}</p>
            </div>

            <div class="hero-kpis">
              <div class="kpi-item">
                <small>Tracks listados</small>
                <strong>{{ trendingTracks.length }}</strong>
              </div>
              <div class="kpi-item">
                <small>Reproducciones totales</small>
                <strong>{{ totalPlaycount | number }}</strong>
              </div>
              <div class="kpi-item">
                <small>Top #1</small>
                <strong>{{ topTrackTitle }}</strong>
              </div>
            </div>
          </div>
        </nb-card-header>
      </nb-card>

      <nb-card class="feature-card">
        <nb-card-header>
          <div class="section-head">
            <div>
              <span class="eyebrow">Top songs</span>
              <h2>Canciones en tendencia</h2>
            </div>
            <span class="live-chip">Actualización dinámica por API</span>
          </div>
        </nb-card-header>

        <nb-card-body>
          <nb-list *ngIf="trendingTracks.length; else emptyState">
            <nb-list-item *ngFor="let track of trendingTracks; trackBy: trackByRank" class="track-item">
              <div class="rank">#{{ track.rank }}</div>
              <img class="cover" [src]="track.cover" [alt]="track.title + ' portada'" />
              <div class="track-info">
                <div class="track-title">{{ track.title }}</div>
                <div class="track-artist">{{ track.artist }}</div>
              </div>
              <div class="track-meta">
                <span class="trend-icon">↑</span>
                <span>{{ track.playcount | number }}</span>
              </div>

              <a class="track-link" [href]="track.url" target="_blank" rel="noopener noreferrer">
                Ver en Last.fm
              </a>
            </nb-list-item>
          </nb-list>

          <ng-template #emptyState>
            <p class="empty-state">No hay canciones para mostrar por el momento.</p>
          </ng-template>
        </nb-card-body>
      </nb-card>
    </section>
  `,
  styles: [`
    .feature-page {
      padding: 1.5rem;
      display: grid;
      gap: 1.25rem;
      max-width: 1080px;
      margin: 0 auto;
    }

    .feature-card {
      width: 100%;
      max-width: 960px;
    }

    .hero-card p {
      margin: 0.5rem 0 0;
      color: rgba(240,244,255,0.72);
      line-height: 1.6;
    }

    .hero-card {
      background:
        radial-gradient(circle at 82% 18%, rgba(0,212,255,.18), transparent 36%),
        radial-gradient(circle at 20% 90%, rgba(255,45,75,.28), transparent 40%),
        linear-gradient(135deg, #0d0f1e 0%, #09091a 52%, #04050a 100%);
      border: 1px solid rgba(255,255,255,0.08);
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.15rem;
      align-items: start;
    }

    .hero-kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(10rem, 1fr));
      gap: 0.85rem;
      width: 100%;
    }

    .kpi-item {
      background: rgba(7,8,15,0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0.75rem;
      padding: 0.85rem 0.9rem;
      min-height: 5.2rem;
      display: grid;
      align-content: center;
      gap: 0.25rem;
    }

    .kpi-item small {
      color: rgba(240,244,255,0.6);
      font-size: 0.68rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .kpi-item strong {
      color: #f0f4ff;
      font-size: 1.35rem;
      white-space: normal;
      overflow-wrap: anywhere;
      line-height: 1.15;
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 0.5rem;
      font-size: 0.75rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #ff6b1a;
    }

    h1, h2 {
      margin: 0;
      line-height: 1.1;
    }

    h1 {
      font-size: 2rem;
      color: #ffffff;
    }

    h2 {
      font-size: 1.25rem;
    }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .live-chip {
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      background: rgba(255,107,26,0.12);
      color: #ff6b1a;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    ::ng-deep nb-list-item {
      min-height: 0 !important;
      padding: 0 !important;
      border: none !important;
    }

    nb-list {
      display: grid;
      gap: 0.5rem;
    }

    .track-item {
      display: grid;
      grid-template-columns: 2.2rem 3rem 1fr 6rem 6.5rem;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 0.65rem;
      background: rgba(7,8,15,0.4);
      min-height: 0;
    }

    .rank {
      font-size: 0.9rem;
      font-weight: 800;
      color: #ff4d6d;
      text-align: center;
    }

    .cover {
      width: 3rem;
      height: 3rem;
      border-radius: 0.5rem;
      object-fit: cover;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .track-info {
      display: grid;
      gap: 0.25rem;
      min-width: 0;
    }

    .track-title {
      font-size: 0.92rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .track-artist {
      font-size: 0.82rem;
      color: var(--text-hint-color, #8f9bb3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-state {
      color: var(--text-hint-color, #8f9bb3);
    }

    .track-meta {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-weight: 700;
      font-size: 0.88rem;
      color: var(--text-hint-color, #8f9bb3);
      white-space: nowrap;
    }

    .trend-icon {
      color: #00d4ff;
      font-weight: 900;
      font-size: 1rem;
      line-height: 1;
    }

    .track-link {
      color: #00d4ff;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.84rem;
      white-space: nowrap;
    }

    .track-link:hover {
      text-decoration: underline;
    }

    .empty-state {
      margin: 0;
    }

    @media (max-width: 640px) {

      .hero-kpis {
        grid-template-columns: 1fr;
      }

      .track-item {
        grid-template-columns: 2rem 2.8rem 1fr;
      }

      .track-meta,
      .track-link {
        display: none;
      }
    }
  `],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  title = 'Dashboard musical';
  description = 'Panel principal para tendencias, rankings y métricas visuales de BeatFlow.';
  trendingTracks: TrendingTrack[] = [];

  constructor(private beatflowExploreService: BeatflowExploreService) {}

  ngOnInit(): void {
    this.beatflowExploreService.getTrendingTracks(10)
      .pipe(
        map((tracks) => tracks.map((track, index) => this.mapTrack(track, index))),
        catchError(() => of(FALLBACK_TRACKS)),
        takeUntil(this.destroy$),
      )
      .subscribe((tracks) => {
        this.trendingTracks = tracks;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByRank(_: number, track: TrendingTrack): number {
    return track.rank;
  }

  get totalPlaycount(): number {
    return this.trendingTracks.reduce((acc, track) => acc + track.playcount, 0);
  }

  get topTrackTitle(): string {
    return this.trendingTracks[0]?.title || 'Sin datos';
  }

  private mapTrack(track: BeatflowTrack, index: number): TrendingTrack {
    return {
      rank: track.rank || index + 1,
      title: track.name,
      artist: track.artist,
      playcount: Number(track.playcount) || 0,
      listeners: Number(track.listeners) || 0,
      cover: track.imageUrl || 'https://placehold.co/96x96/1e293b/f8fafc?text=BF',
      url: this.buildLastFmTrackUrl(track),
    };
  }

  private buildLastFmTrackUrl(track: BeatflowTrack): string {
    const artist = encodeURIComponent(track.artist).replace(/%20/g, '+');
    const trackName = encodeURIComponent(track.name).replace(/%20/g, '+');
    return `https://www.last.fm/music/${artist}/_/${trackName}`;
  }
}

const routes: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
    data: {
      title: 'Dashboard musical',
      description: 'Panel principal para tendencias, rankings y métricas visuales de BeatFlow.',
    },
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NbCardModule, NbListModule],
  declarations: [DashboardPageComponent],
})
export class DashboardModule {
}
