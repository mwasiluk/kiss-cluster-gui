
import {map, catchError} from 'rxjs/operators';


import { Injectable } from '@angular/core';
import { Observable , of} from 'rxjs';
import { Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot } from '@angular/router';

import { Cluster } from './cluster';
import { ClusterService } from './cluster.service';
import {DataService} from '../data.service';
import {NotificationsService} from 'angular2-notifications';

@Injectable()
export class ClusterDetailResolver implements Resolve<Cluster> {
  constructor(private cs: ClusterService, private router: Router, private dataService: DataService, private notificationsService: NotificationsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Cluster> {
    const id = route.paramMap.get('id');

    if (!id) {
      return this.cs.getNewCluster(this.dataService.clusterData);
    }

    return this.cs.getCluster(id).pipe(catchError(e => {
      this.notificationsService.error(e);
      return null;
    }), map(cluster => {
      console.log('cluster', cluster);

      if (cluster) {
        return cluster;
      } else { // id not found
        this.notificationsService.warn(`CLuster ${id} not found!`);
        this.router.navigate(['/']);
        return null;
      }
    }), );

  }
}
