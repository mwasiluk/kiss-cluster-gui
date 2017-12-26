import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import * as AWS from 'aws-sdk';

@Injectable()
export class RegionService {

  public regionChanged$: EventEmitter<string>;

  public region = 'us-east-2';

  constructor() {
    this.regionChanged$ = new EventEmitter();
  }

  update(): void {
    AWS.config.region = this.region;
    this.regionChanged$.emit(this.region);
  }

  getAvailableRegions(): Observable<string[]> {
    return of(['us-east-1', 'us-east-2']);
  }

  subscribe(callback): any {
    return this.regionChanged$.subscribe(callback);
  }
}