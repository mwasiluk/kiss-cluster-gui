import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Queue} from '../queue';
import {Router} from '@angular/router';
import {QueueService} from '../queue.service';
import {Cluster} from '../cluster';
import {QueueDetailsDialogComponent} from '../queue-details-dialog/queue-details-dialog.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/takeUntil';
import {AppConfig} from "../../app-config";
@Component({
  selector: 'app-queue-list',
  templateUrl: './queue-list.component.html',
  styleUrls: ['./queue-list.component.scss']
})
export class QueueListComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() cluster: Cluster;
  queues: Queue[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  displayedColumns = ['name', 'S3_location', 'command', 'creator', 'date', 'jobid', 'maxjobid', 'minjobid', 'status'];
  dataSource = new MatTableDataSource<Queue>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private dialog: MatDialog, private queueService: QueueService) {}

  ngOnInit() {
    this.getQueues();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getQueues(): void {

    Observable.interval(AppConfig.polling_interval)
      .takeUntil(this.destroyed$)
      .switchMap(() => this.queueService.getQueues(this.cluster.clustername))
      .subscribe(queues => {
        this.queues = queues;
        this.dataSource.data = queues;
      });
  }

  createQueueBtnClick() {
    const dialogRef = this.dialog.open(QueueDetailsDialogComponent, {
      width: '500px',
      data: {
        queue: this.queueService.getNewQueueForCluster(this.cluster),
        cluster: this.cluster,
        mode: 'create'
      }
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

}
