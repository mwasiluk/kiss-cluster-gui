import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot } from '@angular/router';

import { Cluster } from './cluster';
import { ClusterService } from './cluster.service';
import {of} from "rxjs/observable/of";

@Injectable()
export class ClusterDetailResolver implements Resolve<Cluster> {
  constructor(private cs: ClusterService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Cluster> {
    const id = route.paramMap.get('id');

    if (!id) {
      return of(this.cs.getNewCluster());
    }

    const cluster = this.cs.getCluster(id);
    if (cluster) {
      return cluster;
    } else { // id not found
      this.router.navigate(['/']);
      return null;
    }
  }
}
