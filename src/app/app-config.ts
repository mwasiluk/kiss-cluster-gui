

import {ServiceConfigurationOptions} from "aws-sdk/lib/service";
import * as AWS from 'aws-sdk';

export class AppConfig {

  public static AWS_REGIONS= ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1', 'ap-south-1',
    'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'cn-northwest-1', 'eu-central-1',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'sa-east-1'];

  public static SCRIPT_NAMES= ['cloud_init_template.sh', 'job_envelope.sh', 'queue_update.sh', 'run_node.sh'];

  public static CLUSTERS_TABLE_NAME= 'kissc_clusters';
  public static QUEUES_TABLE_NAME_PREFIX= 'kissc_queues_';
  public static NODES_TABLE_NAME_PREFIX= 'kissc_nodes_';
  public static JOBS_TABLE_NAME_PREFIX= 'kissc_jobs_';

  public static CLUSTERS_TABLE_ReadCapacityUnits= 2; // 2
  public static CLUSTERS_TABLE_WriteCapacityUnits= 2; // 2
  public static NODES_TABLE_ReadCapacityUnits= 3; // 3
  public static NODES_TABLE_WriteCapacityUnits= 3; // 3
  public static QUEUES_TABLE_ReadCapacityUnits= 2; // 2
  public static QUEUES_TABLE_WriteCapacityUnits= 2; // 2
  public static JOBS_TABLE_ReadCapacityUnits= 4;
  public static JOBS_TABLE_WriteCapacityUnits= 4;

  static S3_CONSOLE_URL = 'https://s3.console.aws.amazon.com';

  public static MINJOBID = 1;
  public static MAXJOBID = 1000000000;
  public static WORKERS_IN_A_NODE= '$(( $nproc / 1 ))';

  public static CLOUD_INIT_TEMPLATE = '';



  public static polling_interval = 5000;
  static SPOT_FLEET_TAG= 'kissc-cluster';

  static awsEndpoint = null;
  public static updateAwsServiceConfig(c?: ServiceConfigurationOptions): ServiceConfigurationOptions{
    c.credentials = AWS.config.credentials;
    c.region = AWS.config.region;
    if( AppConfig.awsEndpoint){
      c.endpoint = AppConfig.awsEndpoint;
    }

    return c;
  }

  public static getSpotRequestConsoleUrl(region: string) {
    return `https://${region}.console.aws.amazon.com/ec2sp/v1/spot/home`;
  }

  public static get_CLOUD_INIT_FILE_NAME(CLUSTERNAME) {
    return `cloud_init_node_${CLUSTERNAME}.sh`;
  }

  public static get_S3_CLOUD_INIT_SCRIPT(S3_LOCATION, CLUSTERNAME) {
    return `${S3_LOCATION}/${AppConfig.get_CLOUD_INIT_FILE_NAME(CLUSTERNAME)}`;
  }

  public static get_S3_RUN_NODE_SCRIPT_KEY(CLUSTERNAME) {
    return `cluster/run_node_${CLUSTERNAME}.sh`;
  }

  public static get_S3_RUN_NODE_SCRIPT(S3_LOCATION, CLUSTERNAME) {
    return `${S3_LOCATION}/${AppConfig.get_S3_RUN_NODE_SCRIPT_KEY(CLUSTERNAME)}`;
  }

  public static get_S3_JOB_ENVELOPE_SCRIPT_KEY() {
    return `cluster/job_envelope.sh`;
  }

  public static get_S3_JOB_ENVELOPE_SCRIPT(S3_LOCATION) {
    return `${S3_LOCATION}/${AppConfig.get_S3_JOB_ENVELOPE_SCRIPT_KEY()}`;
  }

  public static get_S3_QUEUE_UPDATE_SCRIPT_KEY() {
    return `cluster/queue_update.sh`;
  }

  public static get_S3_QUEUE_UPDATE_SCRIPT(S3_LOCATION) {
    return `${S3_LOCATION}/${AppConfig.get_S3_QUEUE_UPDATE_SCRIPT_KEY()}`;
  }

  public static getCloudInitFileContent(REGION, S3_LOCATION, CLUSTERNAME, USERNAME, cloud_init_template) {
    return `#!/bin/bash

CLUSTERNAME=${CLUSTERNAME}
REGION=${REGION}
S3_RUN_NODE_SCRIPT=${AppConfig.get_S3_RUN_NODE_SCRIPT(S3_LOCATION, CLUSTERNAME)}
USERNAME=${USERNAME}
${cloud_init_template}`;

  }

}
