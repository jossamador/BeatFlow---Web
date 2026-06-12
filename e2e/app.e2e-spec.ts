import { browser, by, element, ExpectedConditions as EC } from 'protractor';

describe('BeatFlow App', () => {
  const TIMEOUT = 8000;

  beforeEach(async () => {
    await browser.get('/');
  });

  it('should redirect unauthenticated users to the login page', async () => {
    await browser.wait(EC.urlContains('auth'), TIMEOUT);
    const url = await browser.getCurrentUrl();
    expect(url).toContain('auth');
  });

  it('should display the login form with email and password fields', async () => {
    await browser.wait(EC.urlContains('auth'), TIMEOUT);
    const emailInput = element(by.css('input[type="email"], input[name="email"]'));
    const passwordInput = element(by.css('input[type="password"]'));
    expect(await emailInput.isPresent()).toBe(true);
    expect(await passwordInput.isPresent()).toBe(true);
  });

  it('should NOT load Google Maps API (NbChatModule removed)', async () => {
    await browser.wait(EC.urlContains('auth'), TIMEOUT);
    const mapsLoaded = await browser.executeScript<boolean>(
      `return !!window['google'] && !!window['google']['maps']`,
    );
    expect(mapsLoaded).toBe(false, 'Google Maps API should not be loaded — NbChatModule was removed');
  });

  it('should have the correct page title', async () => {
    const title = await browser.getTitle();
    expect(title.toLowerCase()).toContain('beatflow');
  });
});
