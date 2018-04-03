import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {Cluster} from '../cluster';
import {ClusterService} from '../cluster.service';
import {RegionService} from '../../region.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/startWith';
import {AppConfig} from '../../app-config';
import {NotificationsService} from 'angular2-notifications';
import {Subscription} from 'rxjs/Subscription';
import {BaseListComponent} from '../../base-list/base-list.component';



@Component({
  selector: 'app-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss']
})
export class ClusterListComponent extends BaseListComponent<Cluster> implements OnInit, OnDestroy, AfterViewInit {

  clusters: Cluster[];

  displayedColumns = ['clustername', 'nodes', 'cpu', 'activeNodes', 'activeCPU', 'currentQueue'];



  constructor(private router: Router, private clusterService: ClusterService, protected regionService: RegionService,
              private notificationsService: NotificationsService) {
    super(regionService);
  }

  loadData(): Observable<Cluster[]>{
    return this.clusterService.getClusters(true, true);
  }

  onLoaded(items: Cluster[]) {
    this.clusters = items;
  }

  onLoadingError(e: any) {
    this.notificationsService.error('Error loading clusters', e.message);
    this.clusters = [];
  }

  getClusters(startImmediatelly = false): void {
    this.getItems(startImmediatelly);
  }


  createClusterBtnClick() {
    this.router.navigate(['./cluster/create']);
  }



}
