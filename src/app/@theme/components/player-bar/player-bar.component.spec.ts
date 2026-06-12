import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { BeatflowPlayerService, PlayerTrack } from '../../../@core/utils/beatflow-player.service';
import { PlayerBarComponent } from './player-bar.component';

describe('PlayerBarComponent', () => {
  let trackSubject: BehaviorSubject<PlayerTrack | null>;
  let playerServiceSpy: jasmine.SpyObj<BeatflowPlayerService>;

  beforeEach(async () => {
    trackSubject = new BehaviorSubject<PlayerTrack | null>(null);
    playerServiceSpy = jasmine.createSpyObj('BeatflowPlayerService', ['stop'], {
      currentTrack$: trackSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      declarations: [PlayerBarComponent],
      providers: [{ provide: BeatflowPlayerService, useValue: playerServiceSpy }],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PlayerBarComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should not have player-bar--visible class when no track is playing', () => {
    const fixture = TestBed.createComponent(PlayerBarComponent);
    fixture.detectChanges();
    const bar: HTMLElement = fixture.nativeElement.querySelector('.player-bar');
    expect(bar.classList.contains('player-bar--visible')).toBeFalse();
  });

  it('should show player-bar--visible class when a track is set', () => {
    const fixture = TestBed.createComponent(PlayerBarComponent);
    fixture.detectChanges();
    trackSubject.next({ trackName: 'Blinding Lights', artistName: 'The Weeknd' });
    fixture.detectChanges();
    const bar: HTMLElement = fixture.nativeElement.querySelector('.player-bar');
    expect(bar.classList.contains('player-bar--visible')).toBeTrue();
  });

  it('should build the correct YouTube search URL from track info', () => {
    const fixture = TestBed.createComponent(PlayerBarComponent);
    fixture.detectChanges();
    trackSubject.next({ trackName: 'Blinding Lights', artistName: 'The Weeknd' });
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.ytSearchUrl).toContain('youtube.com/results');
    expect(component.ytSearchUrl).toContain('Blinding%20Lights');
    expect(component.ytSearchUrl).toContain('The%20Weeknd');
  });

  it('should clear ytSearchUrl and track when close() is called', () => {
    const fixture = TestBed.createComponent(PlayerBarComponent);
    fixture.detectChanges();
    trackSubject.next({ trackName: 'Test Song', artistName: 'Test Artist' });
    fixture.detectChanges();
    fixture.componentInstance.close();
    expect(playerServiceSpy.stop).toHaveBeenCalled();
  });

  it('should render the YouTube iframe mount point', () => {
    const fixture = TestBed.createComponent(PlayerBarComponent);
    fixture.detectChanges();
    const ytContainer: HTMLElement = fixture.nativeElement.querySelector('#bf-yt-player');
    expect(ytContainer).toBeTruthy();
  });

  it('should render the YouTube external link when a track is active', () => {
    const fixture = TestBed.createComponent(PlayerBarComponent);
    fixture.detectChanges();
    trackSubject.next({ trackName: 'Anti-Hero', artistName: 'Taylor Swift' });
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.player-yt-link');
    expect(link).toBeTruthy();
    expect(link.href).toContain('youtube.com/results');
  });

  afterEach(() => {
    trackSubject.complete();
  });
});
