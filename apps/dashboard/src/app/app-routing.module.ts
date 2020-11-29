import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportComponent, TablesComponent, ConnectionComponent } from './pages';
import { IsConnectedGuard } from './guards/isConnected.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'connection',
    pathMatch: 'full',
  },
  {
    path: 'connection',
    component: ConnectionComponent,
    data: { menu: { title: 'Connection', link: 'connection', icon: 'login' } },
  },
  {
    path: 'tables',
    component: TablesComponent,
    data: { menu: { title: 'Tables', link: 'tables', icon: 'table_rows' } },
    canActivate: [IsConnectedGuard],
  },
  {
    path: 'export',
    component: ExportComponent,
    data: { menu: { title: 'Export', link: 'export', icon: 'import_export' } },
    canActivate: [IsConnectedGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
