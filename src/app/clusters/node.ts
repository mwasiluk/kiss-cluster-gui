import * as AWS from 'aws-sdk';
export class Node {
  nodeid?: number;
  nodedate?: string;
  ami_id?: string;
  az?: string;
  clusterdate?: string;
  currentqueueid?: number;
  hostname?: string;
  iam_profile?: string;
  instance_id?: string;
  instance_type?: string;
  logfile?: string;
  nproc?: string;
  privateip?: string;
  publicip?: string;
  security_groups?: string;
  active?: boolean;

  $instance?: AWS.EC2.Instance;

  static isActive?(node: Node): boolean {
    return node.$instance && node.$instance.State.Name === 'running';
  }
}
