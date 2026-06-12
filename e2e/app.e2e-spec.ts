import { browser, by, element, ExpectedConditions as EC } from 'protractor';

const TIMEOUT = 10000;

describe('BeatFlow — Smoke tests (rutas y login)', () => {
  it('should load root without Netlify 404', async () => {
    await browser.get('/');
    const source = await browser.getPageSource();
    expect(source).not.toContain('Page not found');
  });

  it('should redirect unauthenticated users to /auth', async () => {
    await browser.get('/');
    await browser.wait(EC.urlContains('auth'), TIMEOUT);
    expect(await browser.getCurrentUrl()).toContain('auth');
  });

  it('should NOT 404 on direct navigation to /pages/dashboard (SPA routing)', async () => {
    await browser.get('/pages/dashboard');
    const source = await browser.getPageSource();
    expect(source).not.toContain('Page not found');
  });

  it('should NOT 404 on direct navigation to /pages/explore/moods (SPA routing)', async () => {
    await browser.get('/pages/explore/moods');
    const source = await browser.getPageSource();
    expect(source).not.toContain('Page not found');
  });

  it('should have page title BeatFlow', async () => {
    await browser.get('/');
    expect((await browser.getTitle()).toLowerCase()).toContain('beatflow');
  });

  it('should display login form inputs', async () => {
    await browser.get('/');
    await browser.wait(EC.urlContains('auth'), TIMEOUT);
    expect(await element(by.css('input[type="email"], input[name="email"]')).isPresent()).toBe(true);
    expect(await element(by.css('input[type="password"]')).isPresent()).toBe(true);
  });
});

describe('BeatFlow — E2E: fixes de consola', () => {
  beforeEach(async () => {
    await browser.get('/');
    await browser.wait(EC.urlContains('auth'), TIMEOUT);
  });

  it('should NOT load Google Maps API (NbChatModule removed)', async () => {
    const mapsLoaded = await browser.executeScript<boolean>(
      `return !!window['google'] && !!window['google']['maps']`,
    );
    expect(mapsLoaded).toBe(false, 'Google Maps no debe cargarse — NbChatModule eliminado');
  });

  it('should render the YouTube player mount point in the DOM', async () => {
    expect(await element(by.css('#bf-yt-player')).isPresent()).toBe(
      true,
      '#bf-yt-player debe existir para el YouTube IFrame API',
    );
  });

  it('should NOT show the player bar before any track is played', async () => {
    expect(await element(by.css('.player-bar--visible')).isPresent()).toBe(
      false,
      'La barra del reproductor no debe estar visible sin pista activa',
    );
  });
});
