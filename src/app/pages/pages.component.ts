import { Component } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  menu: NbMenuItem[] = [
    {
      title: 'Dashboard',
      icon: { icon: 'home-outline', pack: 'eva' },
      link: '/pages/dashboard',
      home: true,
    },
    {
      title: 'Explorar',
      icon: { icon: 'compass-outline', pack: 'eva' },
      link: '/pages/explore',
    },
    {
      title: 'Analítica',
      icon: { icon: 'bar-chart-outline', pack: 'eva' },
      link: '/pages/analytics',
    },
    {
      title: 'Playlists',
      icon: { icon: 'music-outline', pack: 'eva' },
      link: '/pages/playlists',
    },
    {
      title: 'Perfil',
      icon: { icon: 'person-outline', pack: 'eva' },
      link: '/pages/profile',
    },
  ];
}
