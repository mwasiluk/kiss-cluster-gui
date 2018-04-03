import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {SpotFleet} from '../spot-fleet';
import {SpotFleetService} from '../spot-fleet.service';
import {Observable} from 'rxjs/Observable';
import {NotificationsService} from 'angular2-notifications';
import {Cluster} from '../../clusters/cluster';
import {SpotFleetDialogComponent} from '../spot-fleet-dialog/spot-fleet-dialog.component';
import {BaseListComponent} from '../../base-list/base-list.component';
import {RegionService} from '../../region.service';

@Component({
  selector: 'app-spot-fleet-list',
  templateUrl: './spot-fleet-list.component.html',
  styleUrls: ['./spot-fleet-list.component.scss']
})
export class SpotFleetListComponent extends BaseListComponent<SpotFleet>  implements OnInit, OnDestroy, AfterViewInit {

  @Input() cluster: Cluster;

  spotFleets: SpotFleet[];

  displayedColumns = ['id', 'state', 'status', 'targetCapacityCPU', 'currentCapacityCPU', 'instanceTypes', 'cluster', 'amiId', 'actions'];

  constructor(private dialog: MatDialog, private spotFleetService: SpotFleetService, private notificationsService: NotificationsService,
              protected regionService: RegionService) {
    super(regionService);
  }

  getSpotFleets(): void {
    this.getItems(true);
  }

  loadData(): Observable<SpotFleet[]>{
    return this.spotFleetService.getSpotFleets(this.cluster ? this.cluster.clustername : null)
  }

  onLoaded(items: SpotFleet[]) {
    this.spotFleets = items;
  }

  onLoadingError(e: any) {
    this.notificationsService.error('Error loading spot fleets', e.message + ' - error code: ' + e.code);
    this.spotFleets = [];
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


  viewSpotFleet(spotFleet) {
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
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed' , result);
      if (result) {
        this.getSpotFleets();
      }
    });
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
