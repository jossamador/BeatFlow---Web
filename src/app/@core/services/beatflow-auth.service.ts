import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  BeatflowLoginRequest,
  BeatflowLoginResponse,
  BeatflowRegisterRequest,
  BeatflowRegisterResponse,
  BeatflowSession,
  BeatflowUser,
} from './beatflow-api.models';

@Injectable({ providedIn: 'root' })
export class BeatflowAuthService {
  private readonly sessionKey = 'bf_session';
  private readonly apiUrl = `${environment.beatflowApi.baseUrl}/api/auth`;
  private readonly sessionSubject = new BehaviorSubject<BeatflowSession | null>(this.readSession());

  readonly session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(payload: BeatflowRegisterRequest): Observable<BeatflowUser> {
    return this.http
      .post<BeatflowRegisterResponse>(`${this.apiUrl}/register`, this.normalizeRegisterPayload(payload))
      .pipe(map((response) => response.user));
  }

  login(payload: BeatflowLoginRequest): Observable<BeatflowSession> {
    return this.http
      .post<BeatflowLoginResponse>(`${this.apiUrl}/login`, {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      })
      .pipe(map((response) => this.persistSession(response)));
  }

  enterAsGuest(): BeatflowSession {
    const session: BeatflowSession = {
      email: 'guest@beatflow.app',
      name: 'Invitado',
      isGuest: true,
      user: {
        id: 'guest',
        email: 'guest@beatflow.app',
        name: 'Invitado',
      },
    };

    this.setSession(session);
    return session;
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.sessionSubject.next(null);
  }

  getSession(): BeatflowSession | null {
    return this.sessionSubject.value;
  }

  getToken(): string | null {
    return this.sessionSubject.value?.token || null;
  }

  private persistSession(response: BeatflowLoginResponse): BeatflowSession {
    const session: BeatflowSession = {
      token: response.token,
      user: response.user,
      email: response.user.email,
      name: response.user.name || response.user.email,
      photo: response.user.photo,
    };

    this.setSession(session);
    return session;
  }

  private setSession(session: BeatflowSession): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    this.sessionSubject.next(session);
  }

  private readSession(): BeatflowSession | null {
    const rawSession = localStorage.getItem(this.sessionKey);

    if (!rawSession) {
      return null;
    }

    try {
      const session = JSON.parse(rawSession) as BeatflowSession;
      return session?.email ? session : null;
    } catch {
      return null;
    }
  }

  private normalizeRegisterPayload(payload: BeatflowRegisterRequest): BeatflowRegisterRequest {
    const normalizedPayload: BeatflowRegisterRequest = {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    };

    const name = payload.name?.trim();
    const photo = payload.photo?.trim();

    if (name) {
      normalizedPayload.name = name;
    }

    if (photo) {
      normalizedPayload.photo = photo;
    }

    return normalizedPayload;
  }
}
