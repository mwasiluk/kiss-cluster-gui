import {EventEmitter, Injectable} from '@angular/core';

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
  public authChanged$: EventEmitter<boolean>;

  constructor(private regionService: RegionService, private clusterService: ClusterService) {
    this.authChanged$ = new EventEmitter();
  }

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
        this.emit();
        return Observable.of(true);
      }
      this.emit();
      return Observable.of(false);
    });

  }

  logout(): void {
    this.isLoggedIn = false;
    this.emit();
  }

  private emit() {
    this.authChanged$.emit(this.isLoggedIn);
  }

  subscribe(callback, err, complete): any {
    return this.authChanged$.subscribe(callback, err, complete);
  }
}
