import { Injectable } from '@angular/core';
import {Cluster} from './clusters/cluster';
import * as AWS from 'aws-sdk';

@Injectable()
export class DataService {

  clusterData: any;
  instanceProfiles: AWS.IAM.InstanceProfile[];
  s3Buckets: string[];

  constructor() { }

}
