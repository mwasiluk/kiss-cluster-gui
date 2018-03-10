import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SpotFleet} from '../spot-fleet';
import {SpotFleetService} from '../spot-fleet.service';
import {NotificationsService} from 'angular2-notifications';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import {Cluster} from '../../clusters/cluster';
import {AppConfig} from '../../app-config';
import {ClusterService} from '../../clusters/cluster.service';
import * as AWS from 'aws-sdk';
import {FormControl} from "@angular/forms";
import * as _ from "lodash";

@Component({
  selector: 'app-spot-fleet-dialog',
  templateUrl: './spot-fleet-dialog.component.html',
  styleUrls: ['./spot-fleet-dialog.component.scss']
})
export class SpotFleetDialogComponent implements OnInit {

  public spotFleet: SpotFleet;
  public cluster: Cluster;
  public mode = 'view';

  clusters = [];
  availableInstanceTypes = [];
  availableAMIs: AWS.EC2.Image[];
  availableSecurityGroups: AWS.EC2.SecurityGroup[];
  availableKeyPairs: AWS.EC2.KeyPair[];
  availableIamInstanceProfiles: AWS.IAM.InstanceProfile[];


  iamId: string;
  instanceTypes = [];
  amiId: string;
  securityGroup: AWS.EC2.SecurityGroup;
  keyPairName: string;
  iamInstanceProfileArn: string;
  userData = '';

  submitted = false;
  workInProgress = false;


  filteredAmis: Observable<string[]>;

  arnPattern = AppConfig.AWS_ARN_PATTERN;

  constructor(private notificationsService: NotificationsService,
              private spotFleetService: SpotFleetService,
              private clusterService: ClusterService,
              public dialogRef: MatDialogRef<SpotFleetDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.spotFleet = data.spotFleet;
    this.mode = data.mode;
    this.setCluster(data.cluster);
  }

  ngOnInit() {
    if (!this.cluster) {
      this.getClusters();
    }
  }

  private getClusters() {
    this.workInProgress = true;
    this.clusterService.getClusters().finally(() => this.workInProgress = false)
      .subscribe(clusters => {
        this.clusters = clusters;
      }, e => {
        this.notificationsService.error('Error loading clusters', e.message);
        this.clusters = [];
      });
  }

  private setCluster(cluster) {
    console.log(cluster);
    this.cluster = cluster;
    if (!this.cluster) {
      return;
    }
    this.workInProgress = true;
    Observable.forkJoin(
      this.spotFleetService.getAvailableInstanceTypes(),
      this.spotFleetService.describeAMIs(),
      this.spotFleetService.describeSecurityGroups(),
      this.spotFleetService.describeKeyPairs(),
      this.spotFleetService.listIamInstanceProfiles(),
      this.spotFleetService.getNewSpotFleetConfig(this.cluster)
    ).finally(() => this.workInProgress = false)
      .subscribe(r => {
        this.availableInstanceTypes = r[0];
        this.availableAMIs = r[1];
        this.availableSecurityGroups = r[2];
        this.availableKeyPairs = r[3];
        this.availableIamInstanceProfiles = r[4];
        this.spotFleet = r[5];
        this.setDefaults();
        console.log('result', r);
      }, e => {
        this.notificationsService.error(e);
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  private setDefaults() {
    this.securityGroup = _.find(this.availableSecurityGroups, sg => sg.GroupName === 'default');
  }

  parseDate(s) {
    return new Date(s);
  }

  onSubmit() {
    this.submitted = true;
    this.workInProgress = true;

    const regex = new RegExp(this.arnPattern);
    const match = regex.exec(this.iamInstanceProfileArn);
    if (match.length < 4) {
      this.notificationsService.error('Error parsing IAM Instance Profile ARN!');
      return;
    }

    this.iamId = match[1];

    console.log('Extracted IAM:', this.iamId);

    this.spotFleetService.requestSpotFleet(this.spotFleet, this.cluster, this.instanceTypes, this.iamId, this.amiId, this.iamInstanceProfileArn, this.securityGroup.GroupId, this.keyPairName).finally(() => {
      this.workInProgress = false;
    }).subscribe(r => {
      this.notificationsService.success('Spot fleet request success!');
      console.log(r);
      this.dialogRef.close(r);
    }, (e) => {
      this.notificationsService.error('Spot fleet request failure!');
      this.notificationsService.error(e);
    });

  }

  getSpotRequestConsoleUrl(): string {
    return this.spotFleetService.getSpotRequestConsoleUrl();
  }


}
