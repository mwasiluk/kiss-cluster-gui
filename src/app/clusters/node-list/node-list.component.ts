import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Node} from '../node';
import {Router} from '@angular/router';
import {NodeService} from '../node.service';
import {Cluster} from '../cluster';
import {NodeDetailsDialogComponent} from '../node-details-dialog/node-details-dialog.component';

@Component({
  selector: 'app-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.scss']
})
export class NodeListComponent implements OnInit, AfterViewInit {

  @Input() cluster: Cluster;
  nodes: Node[];

  displayedColumns = ['nodeid', 'ami_id', 'currentqueueid', 'instance_type'];
  dataSource = new MatTableDataSource<Node>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private dialog: MatDialog, private nodeService: NodeService) {}

  ngOnInit() {
    this.getClusters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getClusters(): void {
    this.nodeService.getNodes(this.cluster.clustername).subscribe(nodes => {
      this.nodes = nodes;
      this.dataSource.data = nodes;
    });
  }

  createNodeBtnClick() {
    const dialogRef = this.dialog.open(NodeDetailsDialogComponent, {
      width: '500px',
      data: {
        node: new Node(),
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed' , result);
    });
  }

  viewNode(node) {
    const dialogRef = this.dialog.open(NodeDetailsDialogComponent, {
      width: '500px',
      data: {
        node: node,
        mode: 'view'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
