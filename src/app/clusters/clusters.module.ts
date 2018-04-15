import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

import { ClustersRoutingModule } from './clusters-routing.module';
import {ClusterComponent} from './cluster/cluster.component';
import {ClusterListComponent} from './cluster-list/cluster-list.component';
import {ClusterService} from './cluster.service';
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
  MatTableModule, MatToolbarModule, MatSortModule, MatDialogModule, MatProgressSpinnerModule, MatExpansionModule,
  MatSnackBarModule, MatAutocompleteModule, MatSelectModule
} from '@angular/material';

import { QueueListComponent } from './queue-list/queue-list.component';
import {QueueService} from './queue.service';
import {BreadcrumbsModule} from 'ng2-breadcrumbs';
import { QueueDetailsDialogComponent } from './queue-details-dialog/queue-details-dialog.component';
import { NodeListComponent } from './node-list/node-list.component';
import { NodeDetailsDialogComponent } from './node-details-dialog/node-details-dialog.component';
import {NodeService} from './node.service';
import {JobService} from './job.service';
import {SpotFleetsModule} from '../spot-fleets/spot-fleets.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatPaginatorModule, MatToolbarModule, MatSortModule, MatDialogModule, MatProgressSpinnerModule, MatExpansionModule,
    MatSnackBarModule, MatSelectModule, MatAutocompleteModule,
    BreadcrumbsModule,
    SpotFleetsModule,
    ClustersRoutingModule,
  ],
  declarations: [
    ClusterComponent,
    ClusterListComponent,
    QueueListComponent,
    QueueDetailsDialogComponent,
    NodeListComponent,
    NodeDetailsDialogComponent
  ],
  entryComponents: [
    QueueDetailsDialogComponent,
    NodeDetailsDialogComponent
  ],
  providers: [
    DatePipe,
    ClusterService,
    QueueService,
    NodeService,
    JobService
  ],
  exports: [
    ClusterListComponent
  ]

})
export class ClustersModule { }
