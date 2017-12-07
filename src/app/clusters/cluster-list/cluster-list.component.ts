import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {Cluster} from '../cluster';
import {ClusterService} from '../cluster.service';


@Component({
  selector: 'app-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss']
})
export class ClusterListComponent implements OnInit {

  clusters: Cluster[];

  displayedColumns = ['name', 'nodes', 'cpu', 'activeNodes', 'activeCPU', 'currentQueue'];
  dataSource = new MatTableDataSource<Cluster>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private clusterService: ClusterService) {}

  ngOnInit() {
    this.getClusters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getClusters(): void {
    this.clusterService.getClusters().subscribe(clusters => {
      this.clusters = clusters;
      this.dataSource.data = clusters;
    });
  }

  createClusterBtnClick() {
    this.router.navigate(['/cluster/create']);
  }
}
