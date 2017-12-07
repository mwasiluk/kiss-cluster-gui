import { Cluster } from './cluster';

export const CLUSTERS: Cluster[] = [
  { id: '11', name: 'Clus1', nodes: 100, cpu: 400, activeNodes: 50, activeCPU: 200, currentQueue: 'Q0001' },
  { id: '12', name: 'Narco', nodes: 100, cpu: 400, activeNodes: 0, activeCPU: 0, currentQueue: 'Q0002' },
  { id: '13', name: 'Bombasto', nodes: 100, cpu: 400, activeNodes: 50, activeCPU: 200, currentQueue: 'Q0003' },
  { id: '14', name: 'Celeritas', nodes: 100, cpu: 400, activeNodes: 50, activeCPU: 200, currentQueue: 'Q0004' }
];
