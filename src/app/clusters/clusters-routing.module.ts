import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ClusterComponent} from './cluster/cluster.component';
import {ClusterDetailResolver} from './cluster-detail-resolver.service';
import {Cluster} from './cluster';
import {AuthGuard} from '../auth-guard.service';

const routes: Routes = [
  {
    path: 'cluster',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'create',
        component: ClusterComponent,
        data: {
          mode: 'create',
          cluster: new Cluster(),
          breadcrumb: 'Cluster - create'
        }
      },
      {
        path: ':id',
        component: ClusterComponent,
        resolve: {
          cluster: ClusterDetailResolver,
        },
        data: {
          mode: 'view',
          breadcrumb: 'Cluster'
        }
      },
      {
        path: ':id/edit',
        component: ClusterComponent,
        resolve: {
          cluster: ClusterDetailResolver,
        },
        data: {
          mode: 'edit',
          breadcrumb: 'Cluster - edit'
        }

      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ClusterDetailResolver]
})
export class ClustersRoutingModule {
}

