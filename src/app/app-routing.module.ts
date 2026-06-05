import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module')
      .then(m => m.AuthModule),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module')
      .then(m => m.DashboardModule),
  },
  {
    path: 'analytics',
    loadChildren: () => import('./modules/analytics/analytics.module')
      .then(m => m.AnalyticsModule),
  },
  {
    path: 'explore',
    loadChildren: () => import('./modules/explore/explore.module')
      .then(m => m.ExploreModule),
  },
  {
    path: 'playlists',
    loadChildren: () => import('./modules/playlists/playlists.module')
      .then(m => m.PlaylistsModule),
  },
  {
    path: 'profile',
    loadChildren: () => import('./modules/profile/profile.module')
      .then(m => m.ProfileModule),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
