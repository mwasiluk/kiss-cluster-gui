import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import {Queue} from './queue';
import {QUEUES} from './mock-queues';

@Injectable()
export class QueueService {

  constructor() { }

  getQueues(clusterId): Observable<Queue[]> {
    if (!clusterId) {
      return of(QUEUES);
    }
    return of(QUEUES);
  }

  getQueuesForCluster(clusterId): Observable<Queue[]> {
    return of(QUEUES.filter(q => q.clusterId === clusterId));
  }

  getQueue(id: string): Observable<Queue> {
    return of(QUEUES.find(q => q.id === id));
  }
}

