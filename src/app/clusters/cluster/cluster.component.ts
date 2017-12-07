import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import {Cluster} from '../cluster';
import {ClusterService} from '../cluster.service';

@Component({
  selector: 'app-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['./cluster.component.scss']
})
export class ClusterComponent implements OnInit {

  cluster: Cluster;
  mode: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private clusterService: ClusterService,
  ) { }

  ngOnInit() {
    this.getCluster();
  }

  private getCluster() {
    this.route.data
      .subscribe((data: { cluster: Cluster, mode: string }) => {
        this.cluster = data.cluster;
        this.mode = data.mode;
      });
  }

  goBack(): void {
    this.location.back();
  }

  edit() {
    this.router.navigate(['cluster', this.cluster.id, 'edit']);
  }
}
