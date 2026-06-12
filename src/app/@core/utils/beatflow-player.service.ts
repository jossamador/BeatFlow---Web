import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PlayerTrack {
  trackName: string;
  artistName: string;
}

@Injectable({ providedIn: 'root' })
export class BeatflowPlayerService {
  private readonly trackSubject = new BehaviorSubject<PlayerTrack | null>(null);
  readonly currentTrack$ = this.trackSubject.asObservable();

  play(trackName: string, artistName: string): void {
    this.trackSubject.next({ trackName, artistName });
  }

  stop(): void {
    this.trackSubject.next(null);
  }

  get currentTrack(): PlayerTrack | null {
    return this.trackSubject.value;
  }
}
