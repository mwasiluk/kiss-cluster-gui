import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Queue} from '../queue';
import {Router} from '@angular/router';
import {QueueService} from '../queue.service';
import {Cluster} from '../cluster';
import {QueueDetailsDialogComponent} from "../queue-details-dialog/queue-details-dialog.component";

@Component({
  selector: 'app-queue-list',
  templateUrl: './queue-list.component.html',
  styleUrls: ['./queue-list.component.scss']
})
export class QueueListComponent implements OnInit {

  @Input() cluster: Cluster;
  queues: Queue[];

  displayedColumns = ['name', 's3LocationProgram', 'command', 'creator', 'date', 'jobId', 'maxJobId', 'minJobId', 'status'];
  dataSource = new MatTableDataSource<Queue>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private dialog: MatDialog, private queueService: QueueService) {}

  ngOnInit() {
    this.getClusters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getClusters(): void {
    this.queueService.getQueues(this.cluster.id).subscribe(queues => {
      this.queues = queues;
      this.dataSource.data = queues;
    });
  }

  createQueueBtnClick() {
    const dialogRef = this.dialog.open(QueueDetailsDialogComponent, {
      width: '500px',
      data: {
        queue: new Queue(),
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed' , result);
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
