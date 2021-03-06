
import {of as observableOf, throwError as observableThrowError,  Observable, forkJoin } from 'rxjs';

import {catchError, flatMap, map} from 'rxjs/operators';
import {EventEmitter, Injectable} from '@angular/core';



import {Credentials, S3} from 'aws-sdk';
import * as AWS from 'aws-sdk';
import {RegionService} from './region.service';
import {ClusterService} from './clusters/cluster.service';
import {AppConfig} from './app-config';
import {CloudFormationService} from './cloud-formation.service';
import {NotificationsService} from 'angular2-notifications';
import {DataService} from './data.service';
import {S3Service} from './s3.service';

@Injectable()
export class AuthService {

  isLoggedIn = false;
  public authChanged$: EventEmitter<boolean>;

  constructor(private regionService: RegionService, private clusterService: ClusterService, private cloudFormationService: CloudFormationService,
              private notificationsService: NotificationsService, private dataService: DataService, protected s3Service: S3Service) {
    this.authChanged$ = new EventEmitter();
  }

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  login(credentials: Credentials): Observable<boolean> {
    this.setCredentials(credentials);

    // this.cloudFormationService.updateStack().subscribe(r => console.log(r), e => console.log(e));

    return forkJoin(
      this.clusterService.initIfNotExists().pipe(catchError(e => {
        this.isLoggedIn = false;
        return observableThrowError(e);
      }), map(r => !!r)),
      this.cloudFormationService.fetchLambdaInfo().pipe(catchError(e => {
        // this.notificationsService.warn('Error loading S3 bucket list and IAM InstanceProfiles list!', e.message);
        console.log('Error loading S3 bucket list and IAM InstanceProfiles list!', e.message);
        return observableOf(false);
      }), map(data => {
        if (data) {
          this.dataService.s3Buckets = data['Buckets'].map(b => b.Name);
          this.s3Service.bucketList = this.dataService.s3Buckets;
          this.dataService.instanceProfiles = data['InstanceProfiles'];
          this.dataService.lamdaFunctionName = data['FunctionName'];
          console.log(data);
          return true;
        }
        return false;
      }))
    ).pipe(map(r => {
      this.isLoggedIn = r[0];
      this.emit();
      return r[0];
    }));

  }

  setCredentials(credentials: Credentials, updateRegionService = true) {
    AWS.config.credentials = credentials;
    AWS.config.region = this.regionService.region;

    if (updateRegionService) {
      this.regionService.update();
    }
  }

  initCloud(credentials: Credentials): Observable<boolean> {
    this.setCredentials(credentials);

    return this.cloudFormationService.createStack().pipe(flatMap(r => {
      console.log(r);
      if (r) {
        return observableOf(true);
      }
      return observableOf(false);
    }));

  }

  logout(): void {
    this.isLoggedIn = false;
    this.dataService.clear();
    this.emit();
  }

  private emit() {
    this.authChanged$.emit(this.isLoggedIn);
  }

  subscribe(callback, err, complete): any {
    return this.authChanged$.subscribe(callback, err, complete);
  }
}
