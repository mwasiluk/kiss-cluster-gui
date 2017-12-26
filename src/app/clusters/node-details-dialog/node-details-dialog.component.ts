import {Component, Inject, OnInit} from '@angular/core';
import {Node} from '../node';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-node-details-dialog',
  templateUrl: './node-details-dialog.component.html',
  styleUrls: ['./node-details-dialog.component.scss']
})
export class NodeDetailsDialogComponent implements OnInit {

  public node: Node;
  public mode = 'view';

  constructor(
    public dialogRef: MatDialogRef<NodeDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.node = data.node;
    this.mode = data.mode;
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() { }

}
