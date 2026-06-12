import { animate, style, transition, trigger } from '@angular/animations';
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
  BeatflowMood,
  BeatflowSearchResponse,
  BeatflowSearchType,
  BeatflowTrack,
} from '../../@core/services';
import { BeatflowPlayerService } from '../../@core/utils/beatflow-player.service';

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
                <div class="result-actions">
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
                  <!-- HU-11.FE.4: play para canciones en resultados -->
                  <button
                    *ngIf="result.type === 'track'"
                    class="play-btn-sm"
                    (click)="playResult(result)"
                    [title]="'Reproducir ' + result.title"
                  >▶</button>
                </div>
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

    .result-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .play-btn-sm {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: 1px solid rgba(255,77,109,.35);
      background: rgba(255,77,109,.1);
      color: #ff4d6d;
      font-size: 0.7rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, transform 0.1s;
      flex-shrink: 0;
    }

    .play-btn-sm:hover {
      background: rgba(255,77,109,.28);
      transform: scale(1.1);
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

  constructor(
    private beatflowExploreService: BeatflowExploreService,
    private playerService: BeatflowPlayerService,
  ) {}

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

  playResult(result: SearchResult): void {
    this.playerService.play(result.title, result.subtitle);
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
        <img class="detail-image" [src]="artist!.image" [alt]="'Foto de ' + artist!.name" />
        <nb-card-header>
          <span class="eyebrow">Artist Detail</span>
          <h1>{{ artist!.name }}</h1>
        </nb-card-header>
        <nb-card-body>
          <p class="summary">{{ artist!.summary }}</p>
          <div class="detail-stats">
            <p><strong>Reproducciones:</strong> {{ artist!.playcount | number }}</p>
            <p><strong>Oyentes:</strong> {{ artist!.listeners | number }}</p>
          </div>
        </nb-card-body>
        <nb-card-footer>
          <a nbButton status="info" [href]="artist!.url" target="_blank" rel="noopener noreferrer">
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

// ─── HU-08: Moods ────────────────────────────────────────────────────────────

interface MoodCard {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

interface MoodTrack {
  rank: number;
  name: string;
  artist: string;
  imageUrl: string;
  listeners: number;
}

const FALLBACK_MOODS: MoodCard[] = [
  { id: 'happy',    name: 'Feliz',          emoji: '😀', description: 'Canciones alegres para subir el ánimo y llenarte de energía positiva.',        color: 'linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)' },
  { id: 'sad',      name: 'Triste',         emoji: '😢', description: 'Melodías melancólicas y reflexivas ideales para momentos íntimos.',             color: 'linear-gradient(135deg, #30CFD0 0%, #330867 100%)' },
  { id: 'chill',    name: 'Relajado',       emoji: '😌', description: 'Música ambiental y relajante para desconectar del estrés diario.',              color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'energetic',name: 'Enérgico',       emoji: '⚡', description: 'Sonidos potentes y ritmos rápidos para motivarte al máximo.',                   color: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' },
  { id: 'focus',    name: 'Concentración',  emoji: '🧠', description: 'Pistas instrumentales y tranquilas para estudiar o trabajar.',                  color: 'linear-gradient(135deg, #70A1FF 0%, #1E90FF 100%)' },
  { id: 'party',    name: 'Fiesta',         emoji: '🎉', description: 'Los mejores ritmos de club y baile para encender la pista.',                    color: 'linear-gradient(135deg, #F857A6 0%, #FF5858 100%)' },
];

const MOOD_PLACEHOLDER = 'https://placehold.co/300x300/0f172a/f8fafc?text=BF';

@Component({
  selector: 'ngx-bf-moods-page',
  template: `
    <section class="page">

      <div class="page-hero">
        <span class="eyebrow">Explorar</span>
        <h1>Música por Moods</h1>
        <p>Elige un estado de ánimo y descubre las canciones perfectas para ese momento.</p>
      </div>

      <!-- HU-08.FE.1: Cuadrícula de categorías de moods -->
      <div class="moods-grid">
        <button
          class="mood-card"
          *ngFor="let mood of moods; trackBy: trackByMoodId"
          [class.active]="selectedMood?.id === mood.id"
          [style.background]="mood.color"
          (click)="selectMood(mood)"
          [attr.aria-pressed]="selectedMood?.id === mood.id"
          [attr.aria-label]="'Explorar mood ' + mood.name"
        >
          <span class="mood-emoji" aria-hidden="true">{{ mood.emoji }}</span>
          <h3 class="mood-name">{{ mood.name }}</h3>
          <p class="mood-desc">{{ mood.description }}</p>
          <span class="mood-active-indicator" *ngIf="selectedMood?.id === mood.id">
            ✓ Seleccionado
          </span>
        </button>
      </div>

      <!-- HU-08.FE.2 + FE.3: Sección de canciones del mood seleccionado -->
      <div class="tracks-section" *ngIf="selectedMood" [@fadeIn]>

        <div class="tracks-header">
          <div>
            <span class="eyebrow">{{ selectedMood.emoji }} {{ selectedMood.name }}</span>
            <h2>Canciones recomendadas</h2>
          </div>
          <button class="clear-btn" (click)="clearSelection()">✕ Cambiar mood</button>
        </div>

        <!-- Loading -->
        <div class="loading-wrap" *ngIf="isLoading">
          <nb-spinner status="primary" size="large"></nb-spinner>
          <p>Buscando canciones...</p>
        </div>

        <!-- HU-08.FE.3: Cuadrícula dinámica de canciones -->
        <div class="tracks-grid" *ngIf="!isLoading && tracks.length > 0">
          <div
            class="track-card"
            *ngFor="let track of tracks; let i = index; trackBy: trackByTrackName"
          >
            <div class="track-img-wrap">
              <img
                class="track-img"
                [src]="track.imageUrl || moodPlaceholder"
                [alt]="track.name + ' - ' + track.artist"
                (error)="onImgError($event)"
              />
              <span class="track-rank">#{{ track.rank || i + 1 }}</span>
            </div>
            <div class="track-body">
              <h4 class="track-name" [title]="track.name">{{ track.name }}</h4>
              <p class="track-artist">{{ track.artist }}</p>
              <span class="track-listeners">
                <nb-icon icon="headphones-outline" pack="eva"></nb-icon>
                {{ track.listeners | number }} oyentes
              </span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div class="empty-state" *ngIf="!isLoading && tracks.length === 0">
          <span class="empty-icon">🎵</span>
          <p>No encontramos canciones para este mood en este momento.</p>
          <button nbButton status="primary" size="small" (click)="loadTracks(selectedMood!.id)">
            Reintentar
          </button>
        </div>

      </div>

      <!-- Placeholder inicial cuando no hay mood seleccionado -->
      <div class="initial-hint" *ngIf="!selectedMood">
        <span class="hint-icon">👆</span>
        <p>Selecciona un mood para ver las canciones recomendadas</p>
      </div>

    </section>
  `,
  styles: [`
    .page {
      padding: 2rem;
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      gap: 2rem;
    }

    .page-hero {}
    .eyebrow {
      display: block;
      font-size: 0.75rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #ff6b1a;
      margin-bottom: 0.4rem;
    }
    h1 {
      margin: 0;
      font-size: 2.2rem;
      font-weight: 800;
      color: #f8fafc;
    }
    h1 + p {
      margin: 0.4rem 0 0;
      color: rgba(148,163,184,.8);
      font-size: 0.95rem;
    }

    /* ── Mood Grid (HU-08.FE.1) ── */
    .moods-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .mood-card {
      position: relative;
      border: none;
      border-radius: 1.25rem;
      padding: 1.75rem 1.5rem;
      cursor: pointer;
      text-align: left;
      transition: transform 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s, outline 0.15s;
      outline: 3px solid transparent;
      outline-offset: 3px;
    }

    .mood-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,.45);
    }

    .mood-card.active {
      outline-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(255,255,255,.25), 0 12px 32px rgba(0,0,0,.55);
      transform: translateY(-4px);
    }

    .mood-emoji {
      display: block;
      font-size: 2.5rem;
      margin-bottom: 0.6rem;
      line-height: 1;
    }

    .mood-name {
      margin: 0 0 0.4rem;
      font-size: 1.2rem;
      font-weight: 800;
      color: #ffffff;
      text-shadow: 0 1px 4px rgba(0,0,0,.4);
    }

    .mood-desc {
      margin: 0;
      font-size: 0.82rem;
      color: rgba(255,255,255,.85);
      line-height: 1.45;
      text-shadow: 0 1px 3px rgba(0,0,0,.3);
    }

    .mood-active-indicator {
      display: inline-block;
      margin-top: 0.75rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      background: rgba(255,255,255,.25);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      backdrop-filter: blur(4px);
    }

    /* ── Tracks Section (HU-08.FE.2 + FE.3) ── */
    .tracks-section {
      display: grid;
      gap: 1.25rem;
    }

    .tracks-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .tracks-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 800;
      color: #f8fafc;
    }

    .clear-btn {
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 999px;
      color: rgba(240,244,255,.65);
      font-size: 0.84rem;
      padding: 0.4rem 1rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .clear-btn:hover {
      background: rgba(255,255,255,.12);
      color: #f0f4ff;
    }

    .loading-wrap {
      min-height: 12rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: rgba(148,163,184,.7);
      font-size: 0.9rem;
    }

    /* HU-08.FE.3: Cuadrícula dinámica de canciones */
    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }

    .track-card {
      background: rgba(7,8,15,0.7);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 1rem;
      overflow: hidden;
      transition: border-color 0.2s, transform 0.15s;
      cursor: default;
    }

    .track-card:hover {
      border-color: rgba(255,107,26,.35);
      transform: translateY(-3px);
    }

    .track-img-wrap {
      position: relative;
    }

    .track-img {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      display: block;
    }

    .track-rank {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: rgba(0,0,0,.65);
      color: #ff4d6d;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 0.4rem;
      backdrop-filter: blur(4px);
    }

    .track-body {
      padding: 0.85rem;
      display: grid;
      gap: 0.2rem;
    }

    .track-name {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      color: #f0f4ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .track-artist {
      margin: 0;
      font-size: 0.8rem;
      color: rgba(240,244,255,.6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .track-listeners {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.72rem;
      color: rgba(148,163,184,.55);
      margin-top: 0.15rem;
    }

    .track-listeners nb-icon {
      font-size: 0.85rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: rgba(148,163,184,.7);
      display: grid;
      gap: 0.75rem;
      justify-items: center;
    }

    .empty-icon {
      font-size: 2.5rem;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.95rem;
    }

    .initial-hint {
      text-align: center;
      padding: 2rem;
      color: rgba(148,163,184,.5);
      display: grid;
      gap: 0.5rem;
      justify-items: center;
    }

    .hint-icon {
      font-size: 2rem;
    }

    .initial-hint p {
      margin: 0;
      font-size: 0.9rem;
    }

    @media (max-width: 900px) {
      .moods-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 560px) {
      .moods-grid { grid-template-columns: 1fr; }
      .tracks-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('300ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class MoodsPageComponent implements OnInit, OnDestroy {
  moods: MoodCard[] = [];
  selectedMood: MoodCard | null = null;
  tracks: MoodTrack[] = [];
  isLoading = false;
  readonly moodPlaceholder = MOOD_PLACEHOLDER;

  private destroy$ = new Subject<void>();

  constructor(private beatflowExploreService: BeatflowExploreService) {}

  ngOnInit(): void {
    this.beatflowExploreService.getMoods()
      .pipe(
        map((moods) => moods.map((m) => ({
          id: m.id,
          name: m.name,
          emoji: m.emoji,
          description: m.description,
          color: m.color,
        }))),
        catchError(() => of(FALLBACK_MOODS)),
        takeUntil(this.destroy$),
      )
      .subscribe((moods) => {
        this.moods = moods;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectMood(mood: MoodCard): void {
    if (this.selectedMood?.id === mood.id) {
      return;
    }
    this.selectedMood = mood;
    this.tracks = [];
    this.loadTracks(mood.id);
  }

  loadTracks(moodId: string): void {
    this.isLoading = true;

    this.beatflowExploreService.getMoodTracks(moodId, 30)
      .pipe(
        map((tracks) => tracks.map((t, i) => ({
          rank: t.rank || i + 1,
          name: t.name,
          artist: t.artist,
          imageUrl: t.imageUrl || MOOD_PLACEHOLDER,
          listeners: Number(t.listeners) || 0,
        }))),
        catchError(() => of([])),
        takeUntil(this.destroy$),
      )
      .subscribe((tracks) => {
        this.tracks = tracks;
        this.isLoading = false;
      });
  }

  clearSelection(): void {
    this.selectedMood = null;
    this.tracks = [];
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = MOOD_PLACEHOLDER;
  }

  trackByMoodId(_: number, mood: MoodCard): string {
    return mood.id;
  }

  trackByTrackName(_: number, track: MoodTrack): string {
    return `${track.name}-${track.artist}`;
  }
}

const routes: Routes = [
  {
    path: '',
    component: ExplorePageComponent,
  },
  {
    path: 'moods',
    component: MoodsPageComponent,
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
  declarations: [ExplorePageComponent, ArtistDetailPageComponent, MoodsPageComponent],
})
export class ExploreModule {}
