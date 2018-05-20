import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Queue} from '../queue';
import {Router} from '@angular/router';
import {QueueService} from '../queue.service';
import {Cluster} from '../cluster';
import {QueueDetailsDialogComponent} from '../queue-details-dialog/queue-details-dialog.component';
import {Observable, ReplaySubject} from 'rxjs';

import {AppConfig} from '../../app-config';
import {S3Service} from '../../s3.service';
import {NotificationsService} from 'angular2-notifications';
import {BaseListComponent} from '../../base-list/base-list.component';
import {RegionService} from '../../region.service';
@Component({
  selector: 'app-queue-list',
  templateUrl: './queue-list.component.html',
  styleUrls: ['./queue-list.component.scss']
})
export class QueueListComponent extends BaseListComponent<Queue> implements OnInit, OnDestroy, AfterViewInit {

  @Input() cluster: Cluster;
  @Input() queues: Queue[];


  displayedColumns = ['queue_name', 'queueid', 'S3_location', 'command', 'creator', 'date', 'jobid', 'maxjobid', 'minjobid', 'qstatus'];
  loaded = false;


  constructor(private router: Router, private dialog: MatDialog, private queueService: QueueService, private s3Service: S3Service,
              private notificationsService: NotificationsService, protected regionService: RegionService) {
    super(regionService);
  }

  loadData(): Observable<Queue[]> {
    return this.queueService.getQueues(this.cluster.clustername);
  }

  onLoaded(items: Queue[]) {
    this.setQueues(items);
  }

  onLoadingError(e: any) {
    this.notificationsService.error('Error loading queues', e.message);
    this.setQueues([]);
  }

  getQueues(): void {
    return this.getItems(true);
  }

  private setQueues(queues) {
    if (!this.queues) {
      this.queues = [];
    }
    this.loaded = true;
    this.queues.length = 0;
    this.queues.push(...queues);
    this.dataSource.data = this.queues;
  }

  createQueueBtnClick() {
    const dialogRef = this.dialog.open(QueueDetailsDialogComponent, {
      width: '500px',
      data: {
        queue: this.queueService.getNewQueueForCluster(this.cluster),
        cluster: this.cluster,
        mode: 'create'
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed' , result);
      if (result) {
        this.getQueues();
      }
    });
  }

  viewQueue(queue) {
    const dialogRef = this.dialog.open(QueueDetailsDialogComponent, {
      width: '500px',
      data: {
        queue: queue,
        mode: 'view'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openS3(location, file = false) {
    window.open(this.s3Service.getConsoleUrl(location, file), '_blank');
  }

}
