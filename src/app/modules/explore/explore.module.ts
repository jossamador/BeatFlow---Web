import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Injectable, NgModule, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule, Routes } from '@angular/router';
import { NbButtonModule, NbCardModule, NbIconModule, NbSpinnerModule } from '@nebular/theme';
import { Observable, Subject, of } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

interface LastFmArtistImage {
  size: string;
  '#text': string;
}

interface LastFmTopArtist {
  name: string;
  playcount: string;
  listeners: string;
  image: LastFmArtistImage[];
  url: string;
}

interface LastFmTopArtistsResponse {
  artists: {
    artist: LastFmTopArtist[];
  };
}

interface LastFmArtistInfoResponse {
  artist: {
    name: string;
    url: string;
    image: LastFmArtistImage[];
    stats: {
      listeners: string;
      playcount: string;
    };
    bio?: {
      summary?: string;
    };
  };
}

interface PopularArtist {
  name: string;
  image: string;
  playcount: number;
  listeners: number;
  url: string;
}

interface ArtistDetail {
  name: string;
  image: string;
  playcount: number;
  listeners: number;
  summary: string;
  url: string;
}

const FALLBACK_ARTISTS: PopularArtist[] = [
  {
    name: 'The Weeknd',
    image: 'https://placehold.co/320x320/0f172a/f8fafc?text=TW',
    playcount: 129847000,
    listeners: 5083400,
    url: 'https://www.last.fm/music/The+Weeknd',
  },
  {
    name: 'Taylor Swift',
    image: 'https://placehold.co/320x320/111c36/f8fafc?text=TS',
    playcount: 120473000,
    listeners: 4821100,
    url: 'https://www.last.fm/music/Taylor+Swift',
  },
  {
    name: 'Bad Bunny',
    image: 'https://placehold.co/320x320/182544/f8fafc?text=BB',
    playcount: 109554000,
    listeners: 4298000,
    url: 'https://www.last.fm/music/Bad+Bunny',
  },
  {
    name: 'Drake',
    image: 'https://placehold.co/320x320/1f2f56/f8fafc?text=DK',
    playcount: 103348000,
    listeners: 4139400,
    url: 'https://www.last.fm/music/Drake',
  },
];

@Injectable({ providedIn: 'root' })
class PopularArtistsService {
  constructor(private http: HttpClient) {}

  getTopArtists(limit: number = 12): Observable<PopularArtist[]> {
    if (!environment.lastFm.apiKey) {
      return of(FALLBACK_ARTISTS);
    }

    const endpoint = `${environment.lastFm.baseUrl}?method=chart.gettopartists&limit=${limit}&api_key=${environment.lastFm.apiKey}&format=json`;

    return this.http.get<LastFmTopArtistsResponse>(endpoint).pipe(
      map((response) => response.artists.artist.map((artist) => this.mapTopArtist(artist))),
      catchError(() => of(FALLBACK_ARTISTS)),
    );
  }

  getArtistDetail(artistName: string): Observable<ArtistDetail> {
    const fallbackArtist = FALLBACK_ARTISTS.find((artist) => artist.name === artistName) || FALLBACK_ARTISTS[0];

    if (!environment.lastFm.apiKey) {
      return of({
        ...fallbackArtist,
        summary: `${fallbackArtist.name} es uno de los artistas más populares del momento en BeatFlow.`,
      });
    }

    const endpoint = `${environment.lastFm.baseUrl}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${environment.lastFm.apiKey}&format=json`;

    return this.http.get<LastFmArtistInfoResponse>(endpoint).pipe(
      map((response) => this.mapArtistDetail(response)),
      catchError(() => of({
        ...fallbackArtist,
        summary: `${fallbackArtist.name} es uno de los artistas más populares del momento en BeatFlow.`,
      })),
    );
  }

  private mapTopArtist(artist: LastFmTopArtist): PopularArtist {
    return {
      name: artist.name,
      image: this.resolveImage(artist.image),
      playcount: Number(artist.playcount) || 0,
      listeners: Number(artist.listeners) || 0,
      url: artist.url,
    };
  }

  private mapArtistDetail(response: LastFmArtistInfoResponse): ArtistDetail {
    const artist = response.artist;

    return {
      name: artist.name,
      image: this.resolveImage(artist.image),
      playcount: Number(artist.stats.playcount) || 0,
      listeners: Number(artist.stats.listeners) || 0,
      summary: this.toPlainText(artist.bio?.summary || 'Sin descripción disponible.'),
      url: artist.url,
    };
  }

  private resolveImage(images: LastFmArtistImage[]): string {
    return [...images].reverse().find((image) => image['#text'])?.['#text']
      || 'https://placehold.co/320x320/0f172a/f8fafc?text=BF';
  }

  private toPlainText(text: string): string {
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

@Component({
  selector: 'ngx-bf-explore-page',
  template: `
    <section class="feature-page">
      <div class="artists-grid">
        <nb-card class="artist-card" *ngFor="let artist of artists">
          <img class="artist-image" [src]="artist.image" [alt]="'Foto de ' + artist.name" />
          <nb-card-header>
            <span class="eyebrow">Top Artist</span>
            <h2>{{ artist.name }}</h2>
          </nb-card-header>
          <nb-card-body>
            <div class="stats">
              <p><strong>Reproducciones:</strong> {{ artist.playcount | number }}</p>
              <p><strong>Oyentes:</strong> {{ artist.listeners | number }}</p>
            </div>
          </nb-card-body>
          <nb-card-footer>
            <a nbButton status="primary" [routerLink]="['/explore', artist.name]">
              Ver detalle
            </a>
          </nb-card-footer>
        </nb-card>
      </div>
    </section>
  `,
  styles: [`
    .feature-page {
      padding: 1.5rem;
    }

    .artists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }

    .artist-card {
      overflow: hidden;
    }

    .artist-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 0.35rem;
      font-size: 0.75rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-hint-color, #8f9bb3);
    }

    h2 {
      margin: 0;
      font-size: 1.2rem;
    }

    .stats p {
      margin: 0.25rem 0;
      color: var(--text-hint-color, #8f9bb3);
    }
  `],
})
export class ExplorePageComponent implements OnInit, OnDestroy {
  artists: PopularArtist[] = [];
  private destroy$ = new Subject<void>();

  constructor(private popularArtistsService: PopularArtistsService) {}

  ngOnInit(): void {
    this.popularArtistsService.getTopArtists()
      .pipe(takeUntil(this.destroy$))
      .subscribe((artists) => {
        this.artists = artists;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

@Component({
  selector: 'ngx-bf-artist-detail-page',
  template: `
    <section class="detail-page" *ngIf="!isLoading; else loadingTemplate">
      <nb-card *ngIf="artist; else emptyTemplate">
        <img class="detail-image" [src]="artist.image" [alt]="'Foto de ' + artist.name" />
        <nb-card-header>
          <span class="eyebrow">Artist Detail</span>
          <h1>{{ artist.name }}</h1>
        </nb-card-header>
        <nb-card-body>
          <p class="summary">{{ artist.summary }}</p>
          <div class="detail-stats">
            <p><strong>Reproducciones:</strong> {{ artist.playcount | number }}</p>
            <p><strong>Oyentes:</strong> {{ artist.listeners | number }}</p>
          </div>
        </nb-card-body>
        <nb-card-footer>
          <a nbButton status="info" [href]="artist.url" target="_blank" rel="noopener noreferrer">
            Más información en Last.fm
          </a>
        </nb-card-footer>
      </nb-card>
    </section>

    <ng-template #loadingTemplate>
      <section class="detail-page loading">
        <nb-spinner status="primary"></nb-spinner>
      </section>
    </ng-template>

    <ng-template #emptyTemplate>
      <section class="detail-page">
        <nb-card>
          <nb-card-header>
            <h1>Artista no encontrado</h1>
          </nb-card-header>
        </nb-card>
      </section>
    </ng-template>
  `,
  styles: [`
    .detail-page {
      padding: 1.5rem;
      display: grid;
      place-items: center;
    }

    .detail-page nb-card {
      width: 100%;
      max-width: 760px;
    }

    .loading {
      min-height: 40vh;
    }

    .detail-image {
      width: 100%;
      aspect-ratio: 16 / 7;
      object-fit: cover;
    }

    .eyebrow {
      display: inline-block;
      margin-bottom: 0.35rem;
      font-size: 0.75rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-hint-color, #8f9bb3);
    }

    h1 {
      margin: 0;
    }

    .summary {
      line-height: 1.6;
      color: var(--text-hint-color, #8f9bb3);
    }

    .detail-stats p {
      margin: 0.25rem 0;
      color: var(--text-hint-color, #8f9bb3);
    }
  `],
})
export class ArtistDetailPageComponent implements OnInit, OnDestroy {
  artist: ArtistDetail | null = null;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private popularArtistsService: PopularArtistsService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params: ParamMap) => params.get('artistName') || ''),
        switchMap((artistName: string) => this.popularArtistsService.getArtistDetail(artistName)),
        takeUntil(this.destroy$),
      )
      .subscribe((artist) => {
        this.artist = artist;
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

const routes: Routes = [
  {
    path: '',
    component: ExplorePageComponent,
  },
  {
    path: ':artistName',
    component: ArtistDetailPageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbSpinnerModule,
  ],
  declarations: [ExplorePageComponent, ArtistDetailPageComponent],
})
export class ExploreModule {}
