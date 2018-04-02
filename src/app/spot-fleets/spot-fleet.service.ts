import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import {SpotFleet} from './spot-fleet';
import {SPOT_FLEETS} from '../mock-spot-fleets';
import {NotificationsService} from 'angular2-notifications';
import {RegionService} from '../region.service';
import {UtilsService} from '../utils.service';
import * as AWS from 'aws-sdk';
import * as IAM from 'aws-sdk/clients/iam';
import {Cluster} from '../clusters/cluster';
import {AssetsService} from '../assets.service';
import {AppConfig} from '../app-config';
import {ClusterService} from '../clusters/cluster.service';
import {Ec2Service} from '../ec2.service';

@Injectable()
export class SpotFleetService extends Ec2Service{

  ec2: AWS.EC2;
  iam: IAM;

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected utilsService: UtilsService, protected assetsService: AssetsService, private clusterService: ClusterService) {
    super(notificationsService, regionService, assetsService);
  }

  protected initAWS() {

    super.initAWS();

    this.iam = new IAM({
      credentials: AWS.config.credentials,
      region: AWS.config.region
    });
  }

  getSpotFleets(clustername?: string): Observable<SpotFleet[]> {
    return new Observable(observer => {

      this.ec2.describeSpotFleetRequests((err, data) => {
        if (err) {
          console.log(err.message);
          err.message = 'EC2.describeSpotFleetRequests - ' + err.message;
          observer.error(err);
          return;
        }

        let list = data.SpotFleetRequestConfigs.map(this.map);
        if (clustername) {
          list = list.filter(s => s.getClusterName() && s.getClusterName().indexOf(clustername) > -1);
        }
        observer.next(list);
        observer.complete();
      });
    });
  }

  map(data: AWS.EC2.SpotFleetRequestConfig): SpotFleet {
    return new SpotFleet(data);
  }

  requestSpotFleet(spotFleet: SpotFleet, cluster: Cluster, instanceTypes: any[],  iamId: string, amiId: string, iamInstanceProfileArn: string, securityGroupId: string , keyPairName: string): Observable<any> {

    const userDataB64 = btoa(spotFleet.userData);
    const blockDeviceMappings = spotFleet.data.SpotFleetRequestConfig.LaunchSpecifications[0].BlockDeviceMappings;

    spotFleet.data.SpotFleetRequestConfig.IamFleetRole = spotFleet.data.SpotFleetRequestConfig.IamFleetRole.replace('${iamId}', iamId);

    if (!iamInstanceProfileArn.startsWith('arn:aws:iam')){
      iamInstanceProfileArn = `arn:aws:iam::${iamId}:instance-profile/${iamInstanceProfileArn}`;
    }
    spotFleet.data.SpotFleetRequestConfig.LaunchSpecifications = instanceTypes.map(t => {

      return {
        ImageId: amiId,
        InstanceType: t.InstanceType,
        WeightedCapacity: t.WeightedCapacity,
        UserData: userDataB64,
        KeyName: keyPairName,
        IamInstanceProfile: {
          Arn: iamInstanceProfileArn
        },
        SecurityGroups: [{
          GroupId: securityGroupId
        }],
        TagSpecifications: [{
          ResourceType: 'instance',
          Tags: [{
            Key: AppConfig.SPOT_FLEET_TAG,
            Value: cluster.clustername
          }, {
            Key: 'Name',
            Value: AppConfig.getNodeName(cluster)
          }]
        }]
      };
    });

    return this.doRequestSpotFleet(spotFleet);
  }



  doRequestSpotFleet(spotFleet: SpotFleet): Observable<any> {
    return new Observable(observer => {
      this.ec2.requestSpotFleet({
        DryRun: false,
        SpotFleetRequestConfig: spotFleet.data.SpotFleetRequestConfig
      }, (err, data) => {
        console.log(err, data);
        if (err) {
          err.message = 'EC2.requestSpotFleet - ' + err.message;
          observer.error(err);
          return;
        }
        observer.next(data.SpotFleetRequestId);
        observer.complete();
      });
    });
  }

  modifySpotFleetRequest(spotFleet: SpotFleet): Observable<any> {
    return new Observable(observer => {
      this.ec2.modifySpotFleetRequest({
        SpotFleetRequestId: spotFleet.data.SpotFleetRequestId,
        ExcessCapacityTerminationPolicy: 'default',
        TargetCapacity: spotFleet.data.SpotFleetRequestConfig.TargetCapacity
      }, (err, data) => {
        console.log(err, data);
        if (err) {
          err.message = 'EC2.modifySpotFleetRequest - ' + err.message;
          observer.error(err);
          return;
        }
        observer.next(data.Return);
        observer.complete();
      });
    });
  }

  getNewSpotFleetConfig(cluster: Cluster): Observable<SpotFleet> {

    return Observable.forkJoin([
      this.assetsService.get('spot-fleet.json').map(confStr => JSON.parse(confStr)),
      this.clusterService.getCloudInitFileContent(cluster)
    ]).map(r => {
      console.log(r);
      const spotFleet = this.map(this.test(r[0]));
      spotFleet.userData = r[1];
      const date = new Date();
      date.setHours(date.getHours() + AppConfig.SPOT_FLEET_VALID_UNTIL_HOURS_DEFAULT);
      spotFleet.data.SpotFleetRequestConfig.ValidUntil = date;
      return spotFleet;
    });


  }

  test(d): any {
    return {
      SpotFleetRequestConfig: d
    };
  }

  getSpotRequestConsoleUrl() {
    return AppConfig.getSpotRequestConsoleUrl(this.regionService.region);
  }

  terminate(spotFleet: SpotFleet): Observable<any> {
    return new Observable(observer => {
      this.ec2.cancelSpotFleetRequests({
        DryRun: false,
        TerminateInstances: true,
        SpotFleetRequestIds: [spotFleet.data.SpotFleetRequestId]
      }, (err, data) => {
        console.log(err, data);
        if (err) {
          err.message = 'EC2.cancelSpotFleetRequests - ' + err.message;
          observer.error(err);
          return;
        }
        observer.next(true);
        observer.complete();
      });
    });
  }

  getAvailableInstanceTypes(): Observable<any[]> {
    return this.getInstanceTypes();
  }

  describeSpotPriceHistory() {
    this.ec2.describeSpotPriceHistory({
      StartTime: new Date(),
      Filters: [{
        Name: 'availability-zone',
        Values: [this.regionService.region + '*']
      }],
      // InstanceTypes: AppConfig.SPOT_FLEET_INSTANCE_TYPES
    }, (err, data) => {
      if (err) {
        err.message = 'EC2.describeSpotPriceHistory - ' + err.message;
      }

      console.log(err, data);
    });
  }

  getInstanceTypes(): Observable<any> {
    return this.assetsService.get('instance-types.json').map(s => JSON.parse(s)
      .sort((a, b) => parseFloat(a.SpotPrice) * parseInt(a.WeightedCapacity || 1) - parseFloat(b.SpotPrice) * parseInt(b.WeightedCapacity || 1)));
  }
}

