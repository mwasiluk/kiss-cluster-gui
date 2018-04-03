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
import {AppConfig} from '../../app-config';
import {NotificationsService} from 'angular2-notifications';
import {BaseListComponent} from '../../base-list/base-list.component';
import {RegionService} from '../../region.service';

@Component({
  selector: 'app-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.scss']
})
export class NodeListComponent extends BaseListComponent<Node> implements OnInit, OnDestroy, AfterViewInit {

  @Input() cluster: Cluster;
  @Input() nodes: Node[];

  displayedColumns = ['nodeid', 'ami_id', 'currentqueueid', 'instance_type', 'nproc', 'instance_state'];
  loaded = false;
  cpus: number;

  constructor(private router: Router, private dialog: MatDialog, private nodeService: NodeService,
              private notificationsService: NotificationsService, protected regionService: RegionService) {
    super(regionService);
  }

  loadData(): Observable<Node[]> {
    return this.nodeService.getNodes(this.cluster.clustername, true);
  }

  onLoaded(items: Node[]) {
    this.setNodes(items);
  }

  onLoadingError(e: any) {
    this.notificationsService.error('Error loading nodes', e.message);
    this.setNodes([]);
  }

  private setNodes(nodes: Node[]) {
    if (!this.nodes) {
      this.nodes = [];
    }
    this.loaded = true;
    this.nodes.length = 0;
    this.nodes.push(...nodes);
    this.dataSource.data = this.nodes;
    this.cpus = this.nodeService.getCPUs(this.nodes);
  }

  createNodeBtnClick() {
    const dialogRef = this.dialog.open(NodeDetailsDialogComponent, {
      width: '500px',
      data: {
        node: new Node(),
        mode: 'create'
      },
      disableClose: true
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

  getInstancesConsoleUrl(): string {
    return this.nodeService.getInstancesConsoleUrl(this.cluster);
  }

}
