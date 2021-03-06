import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import * as Pages from './pages';
import { IsConnectedGuard, UserPriviledgeGuard } from './guards';
import { environment } from '../environments/environment';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'connection',
    pathMatch: 'full',
  },
  {
    path: 'connection',
    component: Pages.ConnectionComponent,
    data: { menu: { title: 'Connection', link: 'connection', icon: 'login' } },
  },
  {
    path: 'tables',
    loadChildren: () => import('./pages/tables/tables.module').then((m) => m.TablesPageModule),
    data: { menu: { title: 'Tables', link: 'tables', icon: 'table_rows' } },
    canActivate: [IsConnectedGuard],
  },
  {
    path: 'export',
    loadChildren: () => import('./pages/export/export.module').then((m) => m.ExportPageModule),
    data: {
      menu: { title: 'Export', link: 'export', icon: 'import_export' },
      guardPriviledgeRequired: environment.EXPORT_TABLE_REQUIRED_ROLE,
    },
    canActivate: [IsConnectedGuard, UserPriviledgeGuard],
  },
  {
    path: 'users',
    component: Pages.UsersComponent,
    data: { menu: { title: 'Users', link: 'users', icon: 'supervisor_account' } },
    canActivate: [IsConnectedGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      relativeLinkResolution: 'legacy',
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
