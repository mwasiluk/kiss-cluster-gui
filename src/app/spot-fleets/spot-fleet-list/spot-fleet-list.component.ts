import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource, MatSort, MatDialog} from '@angular/material';
import {SpotFleet} from '../spot-fleet';
import {SPOT_FLEETS} from '../../mock-spot-fleets';
import {SpotFleetService} from '../spot-fleet.service';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';
import {NotificationsService} from 'angular2-notifications';
import {AppConfig} from '../../app-config';
import {Cluster} from '../../clusters/cluster';
import {SpotFleetDialogComponent} from '../spot-fleet-dialog/spot-fleet-dialog.component';

@Component({
  selector: 'app-spot-fleet-list',
  templateUrl: './spot-fleet-list.component.html',
  styleUrls: ['./spot-fleet-list.component.scss']
})
export class SpotFleetListComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() cluster: Cluster;

  spotFleets: SpotFleet[];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  displayedColumns = ['id', 'state', 'status', 'targetCapacityCPU', 'currentCapacityCPU', 'instanceTypes', 'cluster', 'amiId', 'actions'];
  dataSource = new MatTableDataSource<SpotFleet>(SPOT_FLEETS);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dialog: MatDialog, private spotFleetService: SpotFleetService, private notificationsService: NotificationsService) { }

  ngOnInit() {
    this.getSpotFleets();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  resetPolling() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.destroyed$ = new ReplaySubject(1);
  }

  getSpotFleets(): void {
    this.resetPolling();

    Observable.interval(AppConfig.polling_interval)
      .takeUntil(this.destroyed$)
      .switchMap(() => this.spotFleetService.getSpotFleets(this.cluster ? this.cluster.clustername : null))
      .subscribe(spotFleets => {
        this.spotFleets = spotFleets;
        this.dataSource.data = spotFleets;
      }, e => {
        this.notificationsService.error('Error loading spot fleets', e.message + ' - error code: ' + e.code);
        this.spotFleets = [];
        this.dataSource.data = this.spotFleets;
        this.destroyed$.next(true);
        this.destroyed$.complete();
      });
  }

  addBtnClick(): void {
    console.log(this.cluster);
    const config = {
      width: '800px',
      data: {
        cluster: this.cluster,
        mode: 'create'
      },
      disableClose: true
    };

    const dialogRef = this.dialog.open(SpotFleetDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed' , result);
      if (result) {

      }
    });
  }


  viewSpotFleet(spotFleet){
    const config = {
      width: '800px',
      data: {
        cluster: this.cluster,
        spotFleet: spotFleet,
        mode: 'view'
      },
      disableClose: true
    };

    const dialogRef = this.dialog.open(SpotFleetDialogComponent, config);
  }

  terminateBtnClick(spotFleet: SpotFleet) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    this.spotFleetService.terminate(spotFleet).subscribe(c => {

      this.notificationsService.success('Spot fleet has been successfully terminated');
      this.getSpotFleets();

    }, (e) => {
      this.notificationsService.error('Spot fleet termination failure!');
      this.notificationsService.error(e);

    });
  }
  getSpotRequestConsoleUrl(): string {
    return this.spotFleetService.getSpotRequestConsoleUrl();
  }
}
