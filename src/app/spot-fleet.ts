
import {Cluster} from './clusters/cluster';

export class SpotFleet {
  id: number;
  name: string;
  state: string;
  targetCapacityCPU: number;
  currentCapacityCPU: number;
  instanceTypes: [string];
  cluster: Cluster;
  bidPerCPU: string;
  amiId: string;
}
