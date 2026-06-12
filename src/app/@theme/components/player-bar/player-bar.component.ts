import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BeatflowPlayerService, PlayerTrack } from '../.././../@core/utils/beatflow-player.service';

@Component({
  selector: 'ngx-player-bar',
  template: `
    <div class="player-bar" *ngIf="track" role="region" aria-label="Reproductor de música">

      <div class="player-inner">

        <!-- Iframe YouTube (HU-11.FE.2 + HU-11.FE.3) -->
        <div class="player-iframe-wrap">
          <iframe
            *ngIf="safeUrl"
            [src]="safeUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            title="Reproductor YouTube BeatFlow"
          ></iframe>
        </div>

        <!-- Info de la pista -->
        <div class="player-info">
          <div class="player-now">▶ Reproduciendo</div>
          <div class="player-track" [title]="track.trackName">{{ track.trackName }}</div>
          <div class="player-artist">{{ track.artistName }}</div>
        </div>

        <!-- Controles -->
        <div class="player-controls">
          <a
            class="player-yt-link"
            [href]="ytSearchUrl"
            target="_blank"
            rel="noopener noreferrer"
            title="Buscar en YouTube"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
            </svg>
            YouTube
          </a>
          <button class="player-close" (click)="close()" aria-label="Cerrar reproductor">✕</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .player-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 9999;
      background:
        linear-gradient(90deg, rgba(7,13,26,.98) 0%, rgba(11,16,34,.98) 100%);
      border-top: 1px solid rgba(255,77,109,.3);
      backdrop-filter: blur(20px);
      box-shadow: 0 -4px 24px rgba(0,0,0,.55);
    }

    .player-inner {
      display: grid;
      grid-template-columns: 280px 1fr auto;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 1.25rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* ── YouTube iframe (HU-11.FE.1) ── */
    .player-iframe-wrap {
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 0.5rem;
      overflow: hidden;
      background: #000;
      flex-shrink: 0;
    }

    .player-iframe-wrap iframe {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* ── Información de la pista ── */
    .player-info {
      min-width: 0;
      display: grid;
      gap: 0.1rem;
    }

    .player-now {
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #ff4d6d;
      font-weight: 700;
    }

    .player-track {
      font-size: 1rem;
      font-weight: 800;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-artist {
      font-size: 0.82rem;
      color: rgba(148,163,184,.75);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Controles ── */
    .player-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .player-yt-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      background: rgba(255,0,0,.15);
      border: 1px solid rgba(255,0,0,.3);
      color: #ff4d4d;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.15s, border-color 0.15s;
    }

    .player-yt-link:hover {
      background: rgba(255,0,0,.25);
      border-color: rgba(255,0,0,.5);
      color: #ff6666;
    }

    .player-close {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(255,255,255,.06);
      color: rgba(240,244,255,.65);
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
    }

    .player-close:hover {
      background: rgba(255,77,109,.2);
      color: #ff4d6d;
      border-color: rgba(255,77,109,.4);
    }

    @media (max-width: 768px) {
      .player-inner {
        grid-template-columns: 160px 1fr auto;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
      }

      .player-track { font-size: 0.9rem; }
    }

    @media (max-width: 480px) {
      .player-inner {
        grid-template-columns: 1fr auto;
      }

      .player-iframe-wrap { display: none; }
    }
  `],
})
export class PlayerBarComponent implements OnInit, OnDestroy {
  track: PlayerTrack | null = null;
  safeUrl: SafeResourceUrl | null = null;
  ytSearchUrl = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly playerService: BeatflowPlayerService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.playerService.currentTrack$
      .pipe(takeUntil(this.destroy$))
      .subscribe((track) => {
        this.track = track;
        if (track) {
          // HU-11.FE.2: construir URL de búsqueda de YouTube
          const query = encodeURIComponent(`${track.trackName} ${track.artistName}`);
          const rawUrl = `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=1&rel=0`;
          // HU-11.FE.3: bypassSecurityTrustResourceUrl para renderizado seguro del iframe
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
          this.ytSearchUrl = `https://www.youtube.com/results?search_query=${query}`;
        } else {
          this.safeUrl = null;
          this.ytSearchUrl = '';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.playerService.stop();
  }
}
