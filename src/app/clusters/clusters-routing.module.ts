import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ClusterComponent} from './cluster/cluster.component';
import {ClusterDetailResolver} from './cluster-detail-resolver.service';
import {Cluster} from './cluster';

const routes: Routes = [
  {
    path: 'cluster/create',
    component: ClusterComponent,
    data: {
      mode: 'create',
      cluster: new Cluster(),
    }
  },
  {
    path: 'cluster/:id',
    component: ClusterComponent,
    resolve: {
      cluster: ClusterDetailResolver,
    },
    data: {
      mode: 'view'
    }
  },
  {
    path: 'cluster/:id/edit',
    component: ClusterComponent,
    resolve: {
      cluster: ClusterDetailResolver,
    },
    data: {
      mode: 'edit'
    }

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ClusterDetailResolver]
})
export class ClustersRoutingModule { }

