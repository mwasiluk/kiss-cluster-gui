import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AboutDialogComponent} from '../../about-dialog/about-dialog.component';
import {Queue} from '../queue';
import {QueueService} from '../queue.service';
import {Cluster} from '../cluster';
import {NotificationsService} from 'angular2-notifications';

@Component({
  selector: 'app-queue-details-dialog',
  templateUrl: './queue-details-dialog.component.html',
  styleUrls: ['./queue-details-dialog.component.scss']
})
export class QueueDetailsDialogComponent implements OnInit {

  public queue: Queue;
  public cluster: Cluster;
  public mode = 'view';

  submitted = false;
  appFiles = [];

  constructor(
    private notificationsService: NotificationsService,
    private queueService: QueueService,
    public dialogRef: MatDialogRef<QueueDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.queue = data.queue;
    this.cluster = data.cluster;
    this.mode = data.mode;
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.appFiles = [];
  }

  onSubmit() {
    this.submitted = true;
    this.queueService.createQueue(this.queue, this.cluster, this.appFiles).subscribe(q => {
      if (!q) {
        this.notificationsService.error('Queue creation failure!');
        return;
      }
      this.notificationsService.success('The queue ' + this.queueService.printQueueID(q) + ' has been successfully created');
      this.dialogRef.close(q);
    });

  }

  filesPicked(files) {
    this.appFiles = files;
  }
}
