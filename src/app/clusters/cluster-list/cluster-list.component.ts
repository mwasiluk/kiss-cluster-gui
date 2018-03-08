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
import {AppConfig} from '../../app-config';
import {NotificationsService} from 'angular2-notifications';


@Component({
  selector: 'app-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss']
})
export class ClusterListComponent implements OnInit, OnDestroy, AfterViewInit {

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  clusters: Cluster[];

  displayedColumns = ['name', 'nodes', 'cpu', 'activeNodes', 'activeCPU', 'currentQueue'];
  dataSource = new MatTableDataSource<Cluster>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private clusterService: ClusterService, private regionService: RegionService,
              private notificationsService: NotificationsService) {}

  ngOnInit() {
    this.regionService.subscribe(r => this.getClusters());
    this.getClusters();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getClusters(): void {
    Observable.interval(AppConfig.polling_interval)
      .takeUntil(this.destroyed$)
      .switchMap(() => this.clusterService.getClusters(true, true))
      .subscribe(clusters => {
        this.clusters = clusters;
        this.dataSource.data = clusters;
      }, e => {
        this.notificationsService.error('Error loading clusters', e.message);
        this.clusters = [];
      });
  }

  createClusterBtnClick() {
    this.router.navigate(['./cluster/create']);
  }
}
