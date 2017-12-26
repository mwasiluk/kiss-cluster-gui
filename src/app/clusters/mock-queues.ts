import { Queue } from './queue';
import { CLUSTERS } from './mock-clusters';

export const QUEUES: Queue[] = [
  // { id: 'Q0001', clusterId: CLUSTERS[0].clustername, queue_name: 'spa2', S3_location: 's3://public-s3/some/folder', command: 'julia SPA.jl',
  //   creator: 'AMI-fsadf', date: new Date(), jobid: 12, maxjobid: 1000000000, minjobid: 1, qstatus: 'active' },
  // { id: 'Q0002', clusterId: CLUSTERS[0].clustername, queue_name: 'spa3', S3_location: 's3://public-s3/some/folder', command: 'julia SPA.jl',
  //   creator: 'AMI-fsadf', date: new Date(), jobid: 12, maxjobid: 1000000000, minjobid: 1, qstatus: 'active' },
];
