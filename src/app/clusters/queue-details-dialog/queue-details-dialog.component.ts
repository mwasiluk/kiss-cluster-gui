import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AboutDialogComponent} from '../../about-dialog/about-dialog.component';
import {Queue} from '../queue';

@Component({
  selector: 'app-queue-details-dialog',
  templateUrl: './queue-details-dialog.component.html',
  styleUrls: ['./queue-details-dialog.component.scss']
})
export class QueueDetailsDialogComponent implements OnInit {

  public queue: Queue;
  public mode = 'view';

  constructor(
    public dialogRef: MatDialogRef<AboutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.queue = data.queue;
    this.mode = data.mode;
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() { }

}
