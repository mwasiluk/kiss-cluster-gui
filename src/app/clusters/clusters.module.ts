import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import { ClustersRoutingModule } from './clusters-routing.module';
import {ClusterComponent} from './cluster/cluster.component';
import {ClusterListComponent} from './cluster-list/cluster-list.component';
import {ClusterService} from './cluster.service';
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
  MatTableModule, MatToolbarModule, MatSortModule
} from '@angular/material';

import { QueueListComponent } from './queue-list/queue-list.component';
import {QueueService} from './queue.service';
import {BreadcrumbsModule} from "ng2-breadcrumbs";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatPaginatorModule, MatToolbarModule, MatSortModule,
    BreadcrumbsModule,
    ClustersRoutingModule,
  ],
  declarations: [
    ClusterComponent,
    ClusterListComponent,
    QueueListComponent,
  ],
  providers: [
    ClusterService,
    QueueService
  ],
  exports: [
    ClusterListComponent
  ]

})
export class ClustersModule { }
