import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import {Cluster} from '../cluster';
import {ClusterService} from '../cluster.service';
import {BreadcrumbsService} from 'ng2-breadcrumbs';
import {MatDialog} from '@angular/material';
import {NotificationsService} from 'angular2-notifications';
import * as FileSaver from 'file-saver';

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
  operationLog = '';
  isNewCluster = false;

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
    this.operationLog = '';
  }

  private getCluster() {
    this.route.data
      .subscribe((data: { cluster: Cluster, mode: string }) => {
        this.cluster = data.cluster;
        this.mode = data.mode;

      });
    // http://localhost:4200/#/cluster/dddddddddddd?is_new=true
    this.route.queryParams.subscribe(params => {
      this.isNewCluster = !!params['is_new'];
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
        this.router.navigate(['/cluster', this.cluster.clustername], { queryParams: { is_new: true } });
      }
    });

  }

  onDelete() {
    if (!window.confirm(`Are sure you want to delete cluster ${this.cluster.clustername}?`)) {
      return;
    }
    this.workInProgress = true;
    this.clusterService.deleteCluster(this.cluster).subscribe(c => {
      this.workInProgress = false;
      if (!c) {
        this.notificationsService.error('Cluster deletion failure!');
      }else {
        this.notificationsService.success('The cluster ' + this.cluster.clustername + ' has been successfully deleted');
        this.router.navigate(['/']);
      }
    });
  }

  onSaveJson() {
    let blob = new Blob([JSON.stringify(this.cluster)], {type: 'application/json'});
    FileSaver.saveAs(blob, `${this.cluster.clustername}.kissc.json`);
  }

}
