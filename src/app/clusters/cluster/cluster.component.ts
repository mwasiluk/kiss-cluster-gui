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
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import {S3Service} from '../../s3.service';
import {Queue} from '../queue';
import {DataService} from '../../data.service';

@Component({
  selector: 'app-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['./cluster.component.scss']
})
export class ClusterComponent implements OnInit {

  cluster: Cluster;
  queues: Queue[] = [];
  nodes: Node[] = [];

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
    protected s3Service: S3Service,
    protected dataService: DataService
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
    // this.location.back();
    this.router.navigate(['/']);
  }

  edit() {
    this.router.navigate(['cluster', this.cluster.clustername, 'edit']);
  }

  onSubmit() {
    this.submitted = true;
    this.workInProgress = true;
    this.clusterService.createCluster(this.cluster).finally(() => {
      this.workInProgress = false;
    }).subscribe(c => {
        this.notificationsService.success('The cluster ' + c.clustername + ' has been successfully created');
        this.router.navigate(['/cluster', this.cluster.clustername], { queryParams: { is_new: true } });
    }, (e) => {
      this.notificationsService.error('Cluster creation failure!');
      this.notificationsService.error(e);
      this.notificationsService.warn('Cleaning up...');
      this.deleteCluster();
    });

  }

  onDelete() {
    if (!window.confirm(`Are sure you want to delete cluster ${this.cluster.clustername}?`)) {
      return;
    }
    this.deleteCluster();
  }

  private deleteCluster(cleanUp = false) {
    this.workInProgress = true;
    this.clusterService.deleteCluster(this.cluster).finally(() => {
      this.workInProgress = false;
    }).subscribe(c => {
      if (cleanUp) {

      }else{
        this.notificationsService.success('The cluster ' + this.cluster.clustername + ' has been successfully deleted');
      }

      this.router.navigate(['/']);

    }, (e) => {
      const msg = cleanUp ? 'Cluster cleanup failed' : 'Cluster deletion failure!';
      this.notificationsService.error(msg);
      this.notificationsService.error(e);

    });
  }

  onSaveJson() {
    const blob = new Blob([JSON.stringify(this.cluster)], {type: 'application/json'});
    FileSaver.saveAs(blob, `${this.cluster.clustername}.kissc.json`);
  }

  openS3(location, file = false) {
    window.open(this.s3Service.getConsoleUrl(location, file), '_blank');
  }

}
