import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import {SpotFleet} from './spot-fleet';
import {SPOT_FLEETS} from './mock-spot-fleets';

@Injectable()
export class SpotFleetService {

  constructor() { }

  getSpotFleets(): Observable<SpotFleet[]> {
    return of(SPOT_FLEETS);
  }
}
