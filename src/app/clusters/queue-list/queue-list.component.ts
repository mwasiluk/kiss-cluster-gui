import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Queue} from '../queue';
import {Router} from '@angular/router';
import {QueueService} from '../queue.service';
import {Cluster} from '../cluster';
import {QueueDetailsDialogComponent} from '../queue-details-dialog/queue-details-dialog.component';

@Component({
  selector: 'app-queue-list',
  templateUrl: './queue-list.component.html',
  styleUrls: ['./queue-list.component.scss']
})
export class QueueListComponent implements OnInit, AfterViewInit {

  @Input() cluster: Cluster;
  queues: Queue[];

  displayedColumns = ['name', 'S3_location', 'command', 'creator', 'date', 'jobid', 'maxjobid', 'minjobid', 'status'];
  dataSource = new MatTableDataSource<Queue>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private dialog: MatDialog, private queueService: QueueService) {}

  ngOnInit() {
    this.getQueues();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getQueues(): void {
    this.queueService.getQueues(this.cluster.clustername).subscribe(queues => {
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
