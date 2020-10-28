import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TablesComponent } from './pages';
import { ConnectionComponent } from './pages/connection/connection.component';
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
    path: '',
    component: ConnectionComponent,
    data: { menu: { title: 'Export', link: 'export', icon: 'import_export' } },
    canActivate: [IsConnectedGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
