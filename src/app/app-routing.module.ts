import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
  },
  /* legacy redirects so old links still work */
  { path: 'dashboard',  redirectTo: 'pages/dashboard',  pathMatch: 'full' },
  { path: 'explore',    redirectTo: 'pages/explore',    pathMatch: 'full' },
  { path: 'analytics',  redirectTo: 'pages/analytics',  pathMatch: 'full' },
  { path: 'playlists',  redirectTo: 'pages/playlists',  pathMatch: 'full' },
  { path: 'profile',    redirectTo: 'pages/profile',    pathMatch: 'full' },
  { path: '',           redirectTo: 'pages/dashboard',  pathMatch: 'full' },
  { path: '**',         redirectTo: 'pages/dashboard' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
