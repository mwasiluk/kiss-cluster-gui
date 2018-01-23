
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

  public static getS3KeyLocation(cluster: Cluster): string {
    return `${cluster.clustername}`;
  }

  public static getS3Location(cluster: Cluster): string {
    if (cluster.S3_location) {
      return cluster.S3_location;
    }
    return `s3://${cluster.$s3_bucket}/${Cluster.getS3KeyLocation(cluster)}`;
  }

  public static getS3Bucket(S3_location: string): string {
    if (!S3_location) {
      return null;
    }
    const exec = /s3:\/\/([a-zA-Z0-9_\-\.]+)\/[a-zA-Z0-9_\-\.]+/g.exec(S3_location);
    if (!exec || exec.length < 2) {
      return null;
    }
    return exec[1];
  }


/*
  public getS3Bucket(): string {
    if (this.$s3_bucket) {
      return this.$s3_bucket;
    }

    this.$s3_bucket = Cluster.getS3Bucket(this.S3_location);

    return this.$s3_bucket;
  }
*/

}
