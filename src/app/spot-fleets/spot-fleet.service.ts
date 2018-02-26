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

@Injectable()
export class SpotFleetService {

  ec2: AWS.EC2;
  iam: IAM;

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected utilsService: UtilsService, protected assetsService: AssetsService, private clusterService: ClusterService) {
    this.regionService.subscribe(r => this.initAWS());
    this.initAWS();
  }

  protected initAWS() {
    this.ec2 = new AWS.EC2({
      credentials: AWS.config.credentials,
      region: AWS.config.region
    });

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

  requestSpotFleet(spotFleet: SpotFleet): Observable<any> {
    return new Observable(observer => {
      this.ec2.requestSpotFleet({
        DryRun: true,
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

  getNewSpotFleetConfig(cluster: Cluster): Observable<SpotFleet> {

    return Observable.forkJoin([
      this.assetsService.get('spot-fleet.json').map(confStr => JSON.parse(confStr)),
      this.clusterService.getCloudInitFileContent(cluster)
    ]).map(r => {
      console.log(r);
      const spotFleet = this.map(this.test(r[0]));
      spotFleet.userData = r[1];
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

  getAvailableInstanceTypes(): Observable<string[]> {
    return of(AppConfig.SPOT_FLEET_INSTANCE_TYPES);
  }

  describeSpotPriceHistory() {
    this.ec2.describeSpotPriceHistory({
      StartTime: new Date(),
      Filters: [{
        Name: 'availability-zone',
        Values: [this.regionService.region + '*']
      }]
    }, (err, data) => {
      err.message = 'EC2.describeSpotPriceHistory - ' + err.message;
      console.log(err, data);
    });
  }

  describeAMIs(): Observable<AWS.EC2.Image[]> {

    return new Observable(observer => {
      this.ec2.describeImages({
        DryRun: false,
        Owners: ['self'],
        // ExecutableUsers: ['self']
      }, (err, data) => {
        console.log(err, data);
        if (err) {
          err.message = 'EC2.describeImages - ' + err.message;
          observer.error(err);
          return;
        }
        observer.next(data.Images);
        observer.complete();

      });
    });
  }

  describeSecurityGroups(): Observable<AWS.EC2.SecurityGroup[]> {

    return new Observable(observer => {
      this.ec2.describeSecurityGroups({
        DryRun: false
      }, (err, data) => {
        console.log(err, data);
        if (err) {
          err.message = 'EC2.describeSecurityGroups - ' + err.message;
          observer.error(err);
          return;
        }
        observer.next(data.SecurityGroups);
        observer.complete();

      });
    });
  }

  describeKeyPairs(): Observable<AWS.EC2.KeyPair[]> {

    return new Observable(observer => {
      this.ec2.describeKeyPairs({
        DryRun: false
      }, (err, data) => {
        console.log(err, data);
        if (err) {
          err.message = 'EC2.describeKeyPairs - ' + err.message;
          observer.error(err);
          return;
        }
        observer.next(data.KeyPairs);
        observer.complete();

      });
    });
  }

  listIamInstanceProfiles(): Observable<IAM.InstanceProfile[]> {
    return of([]); // TODO network error
    // return new Observable(observer => {
    //   this.iam.listInstanceProfiles((err, data) => {
    //     console.log(err, data);
    //     if (err) {
    //       err.message = 'IAM.listInstanceProfiles - ' + err.message;
    //       observer.error(err);
    //       return;
    //     }
    //     observer.next(data.InstanceProfiles);
    //     observer.complete();
    //
    //   });
    // });
  }

}
