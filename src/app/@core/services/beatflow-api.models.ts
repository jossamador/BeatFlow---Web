export interface BeatflowUser {
  id: string;
  email: string;
  name?: string | null;
  photo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BeatflowRegisterRequest {
  email: string;
  password: string;
  name?: string;
  photo?: string;
}

export interface BeatflowRegisterResponse {
  message: string;
  user: BeatflowUser;
}

export interface BeatflowLoginRequest {
  email: string;
  password: string;
}

export interface BeatflowLoginResponse {
  message: string;
  token: string;
  user: BeatflowUser;
}

export interface BeatflowSession {
  token?: string;
  user: BeatflowUser;
  email: string;
  name: string;
  photo?: string | null;
  isGuest?: boolean;
}

export interface BeatflowTrack {
  rank?: number;
  name: string;
  artist: string;
  imageUrl?: string | null;
  listeners: number;
  playcount?: number;
  mbid?: string | null;
}

export interface BeatflowArtist {
  rank?: number;
  name: string;
  imageUrl?: string | null;
  listeners: number;
  playcount?: number;
  mbid?: string | null;
}

export interface BeatflowArtistDetail {
  name: string;
  mbid?: string | null;
  imageUrl?: string | null;
  listeners: number;
  playcount: number;
  summary?: string;
  content?: string;
}

export interface BeatflowSearchResponse {
  tracks: BeatflowTrack[];
  artists: BeatflowArtist[];
}

export type BeatflowSearchType = 'track' | 'artist' | 'all';
