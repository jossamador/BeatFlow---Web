import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'explore',
        loadChildren: () => import('../modules/explore/explore.module').then((m) => m.ExploreModule),
      },
      {
        path: 'analytics',
        loadChildren: () => import('../modules/analytics/analytics.module').then((m) => m.AnalyticsModule),
      },
      {
        path: 'playlists',
        loadChildren: () => import('../modules/playlists/playlists.module').then((m) => m.PlaylistsModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('../modules/profile/profile.module').then((m) => m.ProfileModule),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [CommonModule, ThemeModule, NbMenuModule, RouterModule.forChild(routes)],
  declarations: [PagesComponent],
})
export class PagesModule {}
