import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import {Cluster} from './cluster';
import {CLUSTERS} from './mock-clusters';

@Injectable()
export class ClusterService {

  constructor() { }

  getClusters(): Observable<Cluster[]> {
    return of(CLUSTERS);
  }

  getCluster(id: string): Observable<Cluster> {
    return of(CLUSTERS.find(cluster => cluster.id === id));
  }
}

