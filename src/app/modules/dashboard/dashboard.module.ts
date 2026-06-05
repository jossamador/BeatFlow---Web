import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NbCardModule, NbIconModule, NbListModule } from '@nebular/theme';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

interface LastFmTrackImage {
  size: string;
  '#text': string;
}

interface LastFmTrack {
  name: string;
  playcount: string;
  artist: {
    name: string;
  };
  image: LastFmTrackImage[];
  url: string;
}

interface LastFmTopTracksResponse {
  tracks: {
    track: LastFmTrack[];
  };
}

interface TrendingTrack {
  rank: number;
  title: string;
  artist: string;
  playcount: number;
  cover: string;
  url: string;
}

const FALLBACK_TRACKS: TrendingTrack[] = [
  {
    rank: 1,
    title: 'Midnight Pulse',
    artist: 'BeatFlow Sessions',
    playcount: 128400,
    cover: 'https://placehold.co/96x96/ff4d6d/ffffff?text=B',
    url: '#',
  },
  {
    rank: 2,
    title: 'Neon Lights',
    artist: 'BeatFlow Sessions',
    playcount: 113900,
    cover: 'https://placehold.co/96x96/2dd4bf/0f172a?text=F',
    url: '#',
  },
  {
    rank: 3,
    title: 'Skyline Dreams',
    artist: 'BeatFlow Sessions',
    playcount: 98750,
    cover: 'https://placehold.co/96x96/7c3aed/ffffff?text=W',
    url: '#',
  },
];

class TrendingTracksService {
  constructor(private http: HttpClient) {}

  getTrendingTracks(): Observable<TrendingTrack[]> {
    if (!environment.lastFm.apiKey) {
      return of(FALLBACK_TRACKS);
    }

    return this.http
      .get<LastFmTopTracksResponse>(`${environment.lastFm.baseUrl}?method=chart.gettoptracks&limit=10&api_key=${environment.lastFm.apiKey}&format=json`)
      .pipe(
        map((response) => response.tracks.track.map((track, index) => this.mapTrack(track, index))),
        catchError(() => of(FALLBACK_TRACKS)),
      );
  }

  private mapTrack(track: LastFmTrack, index: number): TrendingTrack {
    const image = [...track.image].reverse().find((item) => item['#text'])?.['#text']
      || 'https://placehold.co/96x96/1e293b/f8fafc?text=BF';

    return {
      rank: index + 1,
      title: track.name,
      artist: track.artist.name,
      playcount: Number(track.playcount) || 0,
      cover: image,
      url: track.url,
    };
  }
}

@Component({
  selector: 'ngx-bf-dashboard-page',
  template: `
    <section class="feature-page">
      <nb-card class="feature-card hero-card">
        <nb-card-header>
          <span class="eyebrow">BeatFlow</span>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
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
                <nb-icon icon="trending-up-outline"></nb-icon>
                <span>{{ track.playcount | number }}</span>
              </div>
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
    }

    .feature-card {
      width: 100%;
      max-width: 960px;
    }

    .hero-card p {
      margin: 0.5rem 0 0;
      color: var(--text-hint-color, #8f9bb3);
      line-height: 1.6;
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 0.5rem;
      font-size: 0.75rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--text-hint-color, #8f9bb3);
    }

    h1, h2 {
      margin: 0;
      line-height: 1.1;
    }

    h1 {
      font-size: 2rem;
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
      background: rgba(45, 212, 191, 0.12);
      color: #2dd4bf;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    nb-list {
      display: grid;
      gap: 0.75rem;
    }

    .track-item {
      display: grid;
      grid-template-columns: 3rem 3.5rem 1fr auto;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 0;
    }

    .rank {
      font-size: 1.1rem;
      font-weight: 800;
      color: #ff4d6d;
    }

    .cover {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 0.75rem;
      object-fit: cover;
      border: 1px solid rgba(148, 163, 184, 0.24);
    }

    .track-info {
      display: grid;
      gap: 0.25rem;
      min-width: 0;
    }

    .track-title {
      font-size: 1rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .track-artist,
    .track-meta,
    .empty-state {
      color: var(--text-hint-color, #8f9bb3);
    }

    .track-meta {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 700;
    }

    .empty-state {
      margin: 0;
    }

    @media (max-width: 640px) {
      .track-item {
        grid-template-columns: 3rem 3.5rem 1fr;
      }

      .track-meta {
        grid-column: 3;
        justify-self: start;
      }
    }
  `],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  title = 'Dashboard musical';
  description = 'Panel principal para tendencias, rankings y métricas visuales de BeatFlow.';
  trendingTracks: TrendingTrack[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const service = new TrendingTracksService(this.http);

    service.getTrendingTracks()
      .pipe(takeUntil(this.destroy$))
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
  imports: [CommonModule, RouterModule.forChild(routes), NbCardModule, NbListModule, NbIconModule],
  declarations: [DashboardPageComponent],
})
export class DashboardModule {
}
