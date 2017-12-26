
export class Cluster {
  clustername?: string;
  nodeid?: number;
  creator?: string;
  date?: string;
  privatekey?: string;
  publickey?: string;
  queueid?: number;
  S3_job_envelope_script?: string;
  S3_location?: string;
  S3_node_init_script?: string;
  S3_queue_update_script?: string;
  S3_run_node_script?: string;
  workers_in_a_node?: string;
  username? = 'ubuntu';

  $cpu?: number;
  $activeNodes?: number;
  $activeCPU?: number;
  $currentQueue?: string;
  $s3_bucket?: string;
}
