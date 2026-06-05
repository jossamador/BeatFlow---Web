import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterModule, Routes } from '@angular/router';
import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbRadioModule,
  NbSpinnerModule,
} from '@nebular/theme';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import {
  BeatflowArtist,
  BeatflowArtistDetail,
  BeatflowExploreService,
  BeatflowSearchResponse,
  BeatflowSearchType,
  BeatflowTrack,
} from '../../@core/services';

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

interface SearchResult {
  type: 'track' | 'artist';
  title: string;
  subtitle: string;
  listeners: number;
  image: string;
  url: string;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/320x320/0f172a/f8fafc?text=BF';

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

const FALLBACK_TRACK_RESULTS: SearchResult[] = [
  {
    type: 'track',
    title: 'Blinding Lights',
    subtitle: 'The Weeknd',
    listeners: 2500000,
    image: 'https://placehold.co/200x200/111c36/f8fafc?text=BL',
    url: 'https://www.last.fm/music/The+Weeknd/_/Blinding+Lights',
  },
  {
    type: 'track',
    title: 'As It Was',
    subtitle: 'Harry Styles',
    listeners: 2100000,
    image: 'https://placehold.co/200x200/182544/f8fafc?text=AIW',
    url: 'https://www.last.fm/music/Harry+Styles/_/As+It+Was',
  },
  {
    type: 'track',
    title: 'Un Verano Sin Ti',
    subtitle: 'Bad Bunny',
    listeners: 1800000,
    image: 'https://placehold.co/200x200/1f2f56/f8fafc?text=UVST',
    url: 'https://www.last.fm/music/Bad+Bunny',
  },
];

@Component({
  selector: 'ngx-bf-explore-page',
  template: `
    <section class="feature-page">
      <nb-card class="search-card">
        <nb-card-header>
          <span class="eyebrow">HU-05</span>
          <h2>Buscar canciones y artistas</h2>
        </nb-card-header>
        <nb-card-body>
          <div class="search-controls">
            <input
              nbInput
              fullWidth
              [formControl]="searchControl"
              placeholder="Escribe para buscar canciones o artistas"
              aria-label="Buscar contenido musical"
            />

            <nb-radio-group [formControl]="filterControl" class="filter-group">
              <nb-radio value="all">Todo</nb-radio>
              <nb-radio value="track">Canciones</nb-radio>
              <nb-radio value="artist">Artistas</nb-radio>
            </nb-radio-group>
          </div>

          <div class="search-loading" *ngIf="isSearching">
            <nb-spinner status="primary"></nb-spinner>
          </div>

          <nb-list *ngIf="!isSearching && searchControl.value && searchResults.length > 0" class="results-list">
            <nb-list-item *ngFor="let result of searchResults; trackBy: trackBySearchResult">
              <div class="result-row">
                <img class="result-image" [src]="result.image" [alt]="'Imagen de ' + result.title" />
                <div class="result-copy">
                  <h3>{{ result.title }}</h3>
                  <p>{{ result.subtitle }}</p>
                  <small>Oyentes: {{ result.listeners | number }}</small>
                </div>
                <a
                  nbButton
                  status="primary"
                  size="small"
                  *ngIf="result.type === 'artist'; else openResultLink"
                  [routerLink]="['/pages/explore', result.title]"
                >
                  Ver detalle
                </a>
                <ng-template #openResultLink>
                  <a nbButton status="info" size="small" [href]="result.url" target="_blank" rel="noopener noreferrer">
                    Abrir
                  </a>
                </ng-template>
              </div>
            </nb-list-item>
          </nb-list>

          <p class="empty-results" *ngIf="!isSearching && searchControl.value && searchResults.length === 0">
            No encontramos resultados para "{{ searchControl.value }}".
          </p>
        </nb-card-body>
      </nb-card>

      <div class="artists-grid">
        <nb-card class="artist-card" *ngFor="let artist of artists; trackBy: trackByArtist">
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
            <a nbButton status="primary" [routerLink]="['/pages/explore', artist.name]">
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
      display: grid;
      gap: 1rem;
    }

    .search-card h2 {
      margin: 0;
      font-size: 1.4rem;
    }

    .search-controls {
      display: grid;
      gap: 0.8rem;
      margin-bottom: 0.8rem;
    }

    .filter-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-loading {
      min-height: 5rem;
      display: grid;
      place-items: center;
    }

    .results-list {
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 0.7rem;
      overflow: hidden;
    }

    .result-row {
      width: 100%;
      display: grid;
      grid-template-columns: 48px 1fr auto;
      gap: 0.8rem;
      align-items: center;
    }

    .result-image {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 0.5rem;
    }

    .result-copy {
      min-width: 0;
    }

    .result-copy h3 {
      margin: 0;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-copy p,
    .result-copy small {
      margin: 0;
      color: rgba(240,244,255,.55);
    }

    .empty-results {
      margin: 0;
      color: rgba(240,244,255,.55);
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
      color: #ff6b1a;
    }

    h2 {
      margin: 0;
      font-size: 1.2rem;
    }

    .stats p {
      margin: 0.25rem 0;
      color: rgba(240,244,255,.55);
    }

    @media (max-width: 640px) {
      .result-row {
        grid-template-columns: 48px 1fr;
      }

      .result-row a[nbButton] {
        grid-column: 1 / -1;
        justify-self: stretch;
      }
    }
  `],
})
export class ExplorePageComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('', { nonNullable: true });
  filterControl = new FormControl<BeatflowSearchType>('all', { nonNullable: true });
  searchResults: SearchResult[] = [];
  artists: PopularArtist[] = [];
  isSearching = false;
  private destroy$ = new Subject<void>();

  constructor(private beatflowExploreService: BeatflowExploreService) {}

  ngOnInit(): void {
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(this.searchControl.value),
        debounceTime(400),
        distinctUntilChanged(),
      ),
      this.filterControl.valueChanges.pipe(startWith(this.filterControl.value)),
    ])
      .pipe(
        switchMap(([query, filter]) => this.searchMusic(query, filter)),
        takeUntil(this.destroy$),
      )
      .subscribe((results) => {
        this.searchResults = results;
      });

    this.beatflowExploreService.getTopArtists()
      .pipe(
        map((artists) => artists.map((artist) => this.mapPopularArtist(artist))),
        catchError(() => of(FALLBACK_ARTISTS)),
        takeUntil(this.destroy$),
      )
      .subscribe((artists) => {
        this.artists = artists;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByArtist(_: number, artist: PopularArtist): string {
    return artist.name;
  }

  trackBySearchResult(_: number, result: SearchResult): string {
    return `${result.type}-${result.title}-${result.subtitle}`;
  }

  private searchMusic(query: string, filter: BeatflowSearchType): Observable<SearchResult[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      this.isSearching = false;
      return of([]);
    }

    this.isSearching = true;

    return this.beatflowExploreService.search(normalizedQuery, filter, 12).pipe(
      map((response) => this.mapSearchResults(response, filter)),
      catchError(() => of(this.fallbackSearchResults(normalizedQuery, filter))),
      finalize(() => {
        this.isSearching = false;
      }),
    );
  }

  private mapSearchResults(response: BeatflowSearchResponse, filter: BeatflowSearchType): SearchResult[] {
    const tracks = filter === 'artist'
      ? []
      : response.tracks.map((track) => this.mapTrackSearchResult(track));
    const artists = filter === 'track'
      ? []
      : response.artists.map((artist) => this.mapArtistSearchResult(artist));

    return [...tracks, ...artists];
  }

  private mapPopularArtist(artist: BeatflowArtist): PopularArtist {
    return {
      name: artist.name,
      image: artist.imageUrl || PLACEHOLDER_IMAGE,
      playcount: Number(artist.playcount) || 0,
      listeners: Number(artist.listeners) || 0,
      url: this.buildLastFmArtistUrl(artist.name),
    };
  }

  private mapTrackSearchResult(track: BeatflowTrack): SearchResult {
    return {
      type: 'track',
      title: track.name,
      subtitle: track.artist,
      listeners: Number(track.listeners) || 0,
      image: track.imageUrl || PLACEHOLDER_IMAGE,
      url: this.buildLastFmTrackUrl(track),
    };
  }

  private mapArtistSearchResult(artist: BeatflowArtist): SearchResult {
    return {
      type: 'artist',
      title: artist.name,
      subtitle: 'Artista',
      listeners: Number(artist.listeners) || 0,
      image: artist.imageUrl || PLACEHOLDER_IMAGE,
      url: this.buildLastFmArtistUrl(artist.name),
    };
  }

  private fallbackSearchResults(query: string, filter: BeatflowSearchType): SearchResult[] {
    const trackResults = filter === 'artist' ? [] : FALLBACK_TRACK_RESULTS;
    const artistResults = filter === 'track'
      ? []
      : FALLBACK_ARTISTS.map((artist) => ({
        type: 'artist' as const,
        title: artist.name,
        subtitle: 'Artista',
        listeners: artist.listeners,
        image: artist.image,
        url: artist.url,
      }));

    return [...trackResults, ...artistResults]
      .filter((result) => this.matchesQuery(result, query));
  }

  private matchesQuery(result: SearchResult, query: string): boolean {
    const normalizedTitle = result.title.toLowerCase();
    const normalizedSubtitle = result.subtitle.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    return normalizedTitle.includes(normalizedQuery) || normalizedSubtitle.includes(normalizedQuery);
  }

  private buildLastFmArtistUrl(artist: string): string {
    return `https://www.last.fm/music/${encodeURIComponent(artist).replace(/%20/g, '+')}`;
  }

  private buildLastFmTrackUrl(track: BeatflowTrack): string {
    const artist = encodeURIComponent(track.artist).replace(/%20/g, '+');
    const trackName = encodeURIComponent(track.name).replace(/%20/g, '+');
    return `https://www.last.fm/music/${artist}/_/${trackName}`;
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
    private beatflowExploreService: BeatflowExploreService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params: ParamMap) => params.get('artistName') || ''),
        switchMap((artistName: string) => this.getArtistDetail(artistName)),
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

  private getArtistDetail(artistName: string): Observable<ArtistDetail> {
    const fallbackArtist = FALLBACK_ARTISTS.find((artist) => artist.name === artistName) || FALLBACK_ARTISTS[0];

    return this.beatflowExploreService.getArtistDetail(artistName).pipe(
      map((artist) => this.mapArtistDetail(artist)),
      catchError(() => of({
        ...fallbackArtist,
        summary: `${fallbackArtist.name} es uno de los artistas mas populares del momento en BeatFlow.`,
      })),
    );
  }

  private mapArtistDetail(artist: BeatflowArtistDetail): ArtistDetail {
    return {
      name: artist.name,
      image: artist.imageUrl || PLACEHOLDER_IMAGE,
      playcount: Number(artist.playcount) || 0,
      listeners: Number(artist.listeners) || 0,
      summary: this.toPlainText(artist.summary || artist.content || 'Sin descripcion disponible.'),
      url: `https://www.last.fm/music/${encodeURIComponent(artist.name).replace(/%20/g, '+')}`,
    };
  }

  private toPlainText(text: string): string {
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbListModule,
    NbRadioModule,
    NbSpinnerModule,
  ],
  declarations: [ExplorePageComponent, ArtistDetailPageComponent],
})
export class ExploreModule {}
