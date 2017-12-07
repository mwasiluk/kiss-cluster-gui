import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {SpotFleet} from '../spot-fleet';
import {SPOT_FLEETS} from '../mock-spot-fleets';
import {SpotFleetService} from '../spot-fleet.service';

@Component({
  selector: 'app-spot-fleet-list',
  templateUrl: './spot-fleet-list.component.html',
  styleUrls: ['./spot-fleet-list.component.scss']
})
export class SpotFleetListComponent implements OnInit {

  displayedColumns = ['name', 'state', 'targetCapacityCPU', 'currentCapacityCPU', 'instanceTypes', 'cluster', 'bidPerCPU', 'amiId'];
  dataSource = new MatTableDataSource<SpotFleet>(SPOT_FLEETS);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private spotFleetService: SpotFleetService) { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getSpotFleets(): void {
    this.spotFleetService.getSpotFleets().subscribe(spotFleets => {
      this.dataSource.data = spotFleets;
    });
  }

}
