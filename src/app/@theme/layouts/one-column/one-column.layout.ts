import { Component } from '@angular/core';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout>
      <nb-layout-header fixed>
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-footer>
        <ngx-footer></ngx-footer>
      </nb-layout-footer>
    </nb-layout>

    <!-- HU-11: Reproductor fijo inferior (position: fixed, z-index: 9999) -->
    <ngx-player-bar></ngx-player-bar>
  `,
})
export class OneColumnLayoutComponent {}
