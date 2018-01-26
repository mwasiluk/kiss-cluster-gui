import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Node} from '../node';
import {Router} from '@angular/router';
import {NodeService} from '../node.service';
import {Cluster} from '../cluster';
import {NodeDetailsDialogComponent} from '../node-details-dialog/node-details-dialog.component';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/takeUntil';
import {AppConfig} from "../../app-config";

@Component({
  selector: 'app-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.scss']
})
export class NodeListComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() cluster: Cluster;
  nodes: Node[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  displayedColumns = ['nodeid', 'ami_id', 'currentqueueid', 'instance_type'];
  dataSource = new MatTableDataSource<Node>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private dialog: MatDialog, private nodeService: NodeService) {}

  ngOnInit() {
    this.getNodes();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getNodes(): void {
    this.nodeService.getNodes(this.cluster.clustername).subscribe(nodes => {
      this.nodes = nodes;
      this.dataSource.data = nodes;
    });

    Observable.interval(AppConfig.polling_interval)
      .takeUntil(this.destroyed$)
      .switchMap(() => this.nodeService.getNodes(this.cluster.clustername))
      .subscribe(nodes => {
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
