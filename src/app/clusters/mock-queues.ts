import { Queue } from './queue';
import { CLUSTERS } from './mock-clusters';

export const QUEUES: Queue[] = [
  { id: 'Q0001', clusterId: CLUSTERS[0].id, name: 'spa2', s3LocationProgram: 's3://public-s3/some/folder', command: 'julia SPA.jl',
    creator: 'AMI-fsadf', date: new Date(), jobId: 12, maxJobId: 1000000000, minJobId: 1, status: 'active' },
  { id: 'Q0002', clusterId: CLUSTERS[0].id, name: 'spa3', s3LocationProgram: 's3://public-s3/some/folder', command: 'julia SPA.jl',
    creator: 'AMI-fsadf', date: new Date(), jobId: 12, maxJobId: 1000000000, minJobId: 1, status: 'active' },
];
