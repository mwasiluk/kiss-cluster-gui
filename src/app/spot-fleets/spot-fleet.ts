
import {Cluster} from '../clusters/cluster';

import * as AWS from 'aws-sdk';
import {AppConfig} from "../app-config";

export class SpotFleet  {
  id?: number;
  name?: string;
  state?: string;
  targetCapacityCPU?: number;
  currentCapacityCPU?: number;
  instanceTypes?: [string];
  cluster?: Cluster;
  bidPerCPU?: string;
  amiId?: string;

  clustername?;
  userData?;

  constructor(public data: AWS.EC2.SpotFleetRequestConfig) {}

  getTargetCapacityCPU() {
    return this.data.SpotFleetRequestConfig.TargetCapacity;
  }

  getInstanceTypes() {
    return this.data.SpotFleetRequestConfig.LaunchSpecifications.map(ls => {
      return ls.InstanceType;
    });
  }

  getClusterName() {
    if (this.clustername) {
      return this.clustername;
    }
    this.clustername =  this.data.SpotFleetRequestConfig.LaunchSpecifications.map(ls => {
      if (!ls.TagSpecifications.length) {
        return null;
      }
      const tags = ls.TagSpecifications[0].Tags.filter(t => t.Key === AppConfig.SPOT_FLEET_TAG);
      if (!tags.length) {
        return null;
      }

      return tags[0].Value;
    });

    return this.clustername;
  }

  getAmiId() {

    return Array.from(new Set(this.data.SpotFleetRequestConfig.LaunchSpecifications.map(ls => ls.ImageId))).join(', ');
  }
}
