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
import {FormControl} from '@angular/forms';
import * as _ from 'lodash';

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
  workInProgress = 0;


  filteredAmis: Observable<string[]>;

  arnPattern = AppConfig.AWS_ARN_PATTERN;
  templateCluster: Cluster;

  constructor(private notificationsService: NotificationsService,
              private spotFleetService: SpotFleetService,
              private clusterService: ClusterService,
              public dialogRef: MatDialogRef<SpotFleetDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.mode = data.mode;
  }

  ngOnInit() {
    this.workInProgress++;

    const fork: any[] = [this.setAvailableData(this.data.cluster)];

    if (!this.data.cluster) {
      fork.push(this.getClusters());
    }

    Observable.forkJoin(fork
    ).finally(() => this.workInProgress--)
      .subscribe(r => {
        this.setData(this.data.cluster, this.data.spotFleet);
      }, e => {
        this.notificationsService.error(e);
        console.log(e);
      });
  }

  private getClusters(): Observable<Cluster[]> {
    this.workInProgress++;
    return new Observable(observer => {
      this.clusterService.getClusters(false, false, false).finally(() => this.workInProgress--)
        .subscribe(clusters => {
          this.clusters = clusters.filter(c => !c.template);
          this.templateCluster = _.find(clusters, c => c.template);
          observer.next(clusters);
          observer.complete();
        }, e => {
          this.notificationsService.error('Error loading clusters', e.message);
          this.clusters = [];
          observer.error(e);
        });
    });
  }


  private setSpotFleet(spotFleet: SpotFleet) {

    this.spotFleet = spotFleet;

    if (!this.spotFleet || !this.spotFleet.data){
      return;
    }



    if (spotFleet.data.SpotFleetRequestConfig) {


      if (spotFleet.data.SpotFleetRequestConfig.LaunchSpecifications.length) {
        const first = spotFleet.data.SpotFleetRequestConfig.LaunchSpecifications[0];
        this.amiId = first.ImageId;
        this.iamInstanceProfileArn = this.iamInstanceProfileArn || first.IamInstanceProfile.Arn;
        if (first.SecurityGroups.length) {
          this.securityGroup = _.find(this.availableSecurityGroups, sg => sg.GroupId === first.SecurityGroups[0].GroupId);
        }
        this.keyPairName = first.KeyName;
        if (!spotFleet.userData || !spotFleet.userData.length) {
          this.userData = atob(first.UserData);
          spotFleet.userData = this.userData;
        }

      }



      this.instanceTypes = spotFleet.data.SpotFleetRequestConfig.LaunchSpecifications.map(ls => _.find(this.availableInstanceTypes, t => t.InstanceType === ls.InstanceType));
    }
  }

  private setAvailableData(fetchTemplateCluster = false): Observable<boolean> {
    return Observable.forkJoin(
      this.spotFleetService.getAvailableInstanceTypes(),
      this.spotFleetService.describeAMIs(),
      this.spotFleetService.describeSecurityGroups(),
      this.spotFleetService.describeKeyPairs(),
      this.spotFleetService.listIamInstanceProfiles(),
      fetchTemplateCluster ? this.clusterService.getTemplateCluster() : Observable.of(null)
    ).map(r => {
        this.availableInstanceTypes = r[0];
        this.availableAMIs = r[1];
        this.availableSecurityGroups = r[2];
        this.availableKeyPairs = r[3];
        this.availableIamInstanceProfiles = r[4];
        if(fetchTemplateCluster) {
          this.templateCluster = r[5];
        }
        // this.spotFleet = r[5];
        console.log('result', r);
        return true;
      });
  }

  protected setData(cluster: Cluster, spotFleet: SpotFleet) {
    if (!cluster && !spotFleet) {
      return;
    }
    this.workInProgress++;
    this.cluster = cluster;

    Observable.forkJoin(
      spotFleet ? Observable.of(spotFleet) : this.spotFleetService.getNewSpotFleetConfig(cluster)
    ).finally(() => this.workInProgress--)
      .subscribe(r => {
        this.setDefaults();
        this.setSpotFleet(r[0]);
        // this.spotFleet = r[5];

        console.log('result', r);
      }, e => {
        this.notificationsService.error(e);
        console.log(e);
      });
  }

  public setCluster(cluster) {
    this.setData(cluster, null);
  }

  close(): void {
    this.dialogRef.close();
  }

  private setDefaults() {
    this.securityGroup = _.find(this.availableSecurityGroups, sg => sg.GroupName === 'default');
    if (this.cluster) {
      console.log('dasda', this.cluster, this.templateCluster);
      this.iamInstanceProfileArn = this.iamInstanceProfileArn || this.cluster.spot_fleet_arn_instance_profile || (this.templateCluster ? this.templateCluster.spot_fleet_arn_instance_profile : '');
      if (this.iamInstanceProfileArn && !this.availableIamInstanceProfiles.length) {
        this.availableIamInstanceProfiles.push({
          Arn: this.iamInstanceProfileArn,
          Path: undefined,
          InstanceProfileName: undefined,
          InstanceProfileId: undefined,
          CreateDate: undefined,
          Roles: undefined
        });
      }
    }
  }

  parseDate(s) {
    return new Date(s);
  }

  edit() {
    this.mode = 'edit';
  }

  onSubmit() {
    this.submitted = true;

    if (this.mode === 'create') {
      this.requestSpotFleet();
    } else {
      this.modifySpotFleetRequest();
    }
  }

  modifySpotFleetRequest() {
    this.workInProgress++;
    this.spotFleetService.modifySpotFleetRequest(this.spotFleet).finally(() => {
      this.workInProgress--;
    }).subscribe(r => {
      this.notificationsService.success('Spot fleet modification success!');
      console.log(r);
      this.mode = 'view';
    }, (e) => {
      this.notificationsService.error('Spot fleet modification failure!');
      this.notificationsService.error(e);
    });
  }

  requestSpotFleet() {
    const regex = new RegExp(this.arnPattern);
    const match = regex.exec(this.iamInstanceProfileArn);
    if (match.length < 4) {
      this.notificationsService.error('Error parsing IAM Instance Profile ARN!');
      return;
    }

    this.workInProgress++;
    this.iamId = match[1];

    console.log('Extracted IAM:', this.iamId);

    this.spotFleetService.requestSpotFleet(this.spotFleet, this.cluster, this.instanceTypes, this.iamId, this.amiId, this.iamInstanceProfileArn, this.securityGroup.GroupId, this.keyPairName).finally(() => {
      this.workInProgress--;
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
