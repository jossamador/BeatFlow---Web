import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  BeatflowArtist,
  BeatflowArtistDetail,
  BeatflowSearchResponse,
  BeatflowSearchType,
  BeatflowTrack,
} from './beatflow-api.models';

@Injectable({ providedIn: 'root' })
export class BeatflowExploreService {
  private readonly apiUrl = `${environment.beatflowApi.baseUrl}/api/explore`;

  constructor(private http: HttpClient) {}

  getTrendingTracks(limit: number = 10, page: number = 1): Observable<BeatflowTrack[]> {
    return this.http.get<BeatflowTrack[]>(`${this.apiUrl}/trends`, {
      params: this.paginationParams(limit, page),
    });
  }

  getTopArtists(limit: number = 12, page: number = 1): Observable<BeatflowArtist[]> {
    return this.http.get<BeatflowArtist[]>(`${this.apiUrl}/artists/trends`, {
      params: this.paginationParams(limit, page),
    });
  }

  getArtistDetail(artist: string): Observable<BeatflowArtistDetail> {
    return this.http.get<BeatflowArtistDetail>(`${this.apiUrl}/artists/detail`, {
      params: new HttpParams().set('artist', artist),
    });
  }

  search(query: string, type: BeatflowSearchType = 'all', limit: number = 10, page: number = 1): Observable<BeatflowSearchResponse> {
    const params = this.paginationParams(limit, page)
      .set('q', query)
      .set('type', type);

    return this.http
      .get<BeatflowSearchResponse | BeatflowTrack[] | BeatflowArtist[]>(`${this.apiUrl}/search`, { params })
      .pipe(map((response) => this.normalizeSearchResponse(response, type)));
  }

  private paginationParams(limit: number, page: number): HttpParams {
    return new HttpParams()
      .set('limit', String(limit))
      .set('page', String(page));
  }

  private normalizeSearchResponse(
    response: BeatflowSearchResponse | BeatflowTrack[] | BeatflowArtist[],
    type: BeatflowSearchType,
  ): BeatflowSearchResponse {
    if (!Array.isArray(response)) {
      return {
        tracks: response.tracks || [],
        artists: response.artists || [],
      };
    }

    return type === 'artist'
      ? { tracks: [], artists: response as BeatflowArtist[] }
      : { tracks: response as BeatflowTrack[], artists: [] };
  }
}
