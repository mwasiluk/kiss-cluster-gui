import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import {AuthGuard} from './auth-guard.service';


const routes: Routes = [
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules, useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
