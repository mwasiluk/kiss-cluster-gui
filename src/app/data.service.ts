import { Injectable } from '@angular/core';
import {Cluster} from './clusters/cluster';
import * as AWS from 'aws-sdk';

@Injectable()
export class DataService {

  clusterData: any;
  instanceProfiles: AWS.IAM.InstanceProfile[];
  s3Buckets: string[];

  constructor() { }

  getInstanceProfilesForBucket(s3_bucket) {

    if (!s3_bucket) {
      return this.instanceProfiles;
    }

    const resourceRegex = `^\\*$|arn:aws:s3:::${s3_bucket}.*`;

    return this.instanceProfiles.filter(ip => ip.Roles.some(r => r['Policies'].some(p => {
      return p.PolicyDocument.Statement.some(s => {
        if (!s.Action.startsWith('s3:*') || s.Effect !== 'Allow') {
          return false;
        }

        return s.Resource.some(res => {

          console.log(res, resourceRegex, res.match(resourceRegex));

          return res.match(resourceRegex);
        });
      });
    })));
  }
}
