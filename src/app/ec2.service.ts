import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import {NotificationsService} from 'angular2-notifications';
import {RegionService} from './region.service';
import {UtilsService} from './utils.service';
import * as AWS from 'aws-sdk';
import * as IAM from 'aws-sdk/clients/iam';

import {AppConfig} from './app-config';
import {AssetsService} from "./assets.service";


@Injectable()
export class Ec2Service {

  ec2: AWS.EC2;
  iam: IAM;

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected assetsService: AssetsService) {
    this.regionService.subscribe(r => this.initAWS());
    this.initAWS();
  }

  protected initAWS() {
    this.ec2 = new AWS.EC2({
      credentials: AWS.config.credentials,
      region: AWS.config.region
      // endpoint: AWS.config.apigateway.endpoint
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

  describeInstances(): Observable<AWS.EC2.Reservation[]> {

    return new Observable(observer => {
      this.ec2.describeInstances({
        DryRun: false,

        // ExecutableUsers: ['self']
      }, (err, data) => {
        if (err) {
          err.message = 'EC2.describeInstances - ' + err.message;
          console.log(err, data);
          observer.error(err);
          return;
        }
        observer.next(data.Reservations);
        observer.complete();

      });
    });
  }

}

