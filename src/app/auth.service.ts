import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import {Credentials, S3} from 'aws-sdk';
import * as AWS from 'aws-sdk';
import {RegionService} from './region.service';
import {ClusterService} from './clusters/cluster.service';

@Injectable()
export class AuthService {

  isLoggedIn = false;

  constructor(private regionService: RegionService, private clusterService: ClusterService) { }

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  login(credentials: Credentials): Observable<boolean> {
    // AWS.config.region
    AWS.config.credentials = credentials;
    AWS.config.region = this.regionService.region;
    this.regionService.update();

    return this.clusterService.createTableIfNotExists().flatMap(r => {
      if (r) {
        this.isLoggedIn = true;
        return Observable.of(true);
      }
      return Observable.of(false);
    });

  }

  logout(): void {
    this.isLoggedIn = false;
  }
}
