import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';

import { BeatflowAuthService } from '../services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private authService: BeatflowAuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.requireSession();
  }

  canActivateChild(): boolean | UrlTree {
    return this.requireSession();
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    void route;
    void segments;
    return this.requireSession();
  }

  private requireSession(): boolean | UrlTree {
    return this.authService.getSession() ? true : this.router.parseUrl('/auth/login');
  }
}
