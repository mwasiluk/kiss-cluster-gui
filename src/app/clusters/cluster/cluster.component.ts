import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import {Cluster} from '../cluster';
import {ClusterService} from '../cluster.service';
import {BreadcrumbsService} from 'ng2-breadcrumbs';
import {MatDialog} from '@angular/material';
import {NotificationsService} from "angular2-notifications";

@Component({
  selector: 'app-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['./cluster.component.scss']
})
export class ClusterComponent implements OnInit {

  cluster: Cluster;
  mode: string;

  submitted = false;
  workInProgress = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private notificationsService: NotificationsService,
    private dialog: MatDialog,
    private clusterService: ClusterService,
    private breadcrumbs: BreadcrumbsService,
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
    this.router.navigate(['cluster', this.cluster.clustername, 'edit']);
  }

  onSubmit() {
    this.submitted = true;
    this.workInProgress = true;
    this.clusterService.createCluster(this.cluster).subscribe(c => {
      this.workInProgress = false;
      if (!c) {
        this.notificationsService.error('Cluster creation failure!');
      }else {
        this.notificationsService.success('The cluster ' + c.clustername + ' has been successfully created');
        this.router.navigate(['/cluster', this.cluster.clustername]);
      }
    });

  }

}
