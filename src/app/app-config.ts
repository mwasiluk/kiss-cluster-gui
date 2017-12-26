

export class AppConfig {

  public static CLUSTERS_TABLE_NAME= 'kissc_clusters';
  public static QUEUES_TABLE_NAME_PREFIX= 'kissc_queues_';
  public static NODES_TABLE_NAME_PREFIX= 'kissc_nodes_';
  public static JOBS_TABLE_NAME_PREFIX= 'kissc_jobs_';

  public static CLUSTERS_TABLE_ReadCapacityUnits= 2;
  public static CLUSTERS_TABLE_WriteCapacityUnits= 2;
  public static NODES_TABLE_ReadCapacityUnits= 3;
  public static NODES_TABLE_WriteCapacityUnits= 3;
  public static QUEUES_TABLE_ReadCapacityUnits= 2;
  public static QUEUES_TABLE_WriteCapacityUnits= 2;
  public static JOBS_TABLE_ReadCapacityUnits= 4;
  public static JOBS_TABLE_WriteCapacityUnits= 4;

  public static MINJOBID = 1;
  public static MAXJOBID = 1000000000;
  public static WORKERS_IN_A_NODE= '$(( $nproc / 1 ))';

  public static CLOUD_INIT_TEMPLATE = '';


  public static get_CLOUD_INIT_FILE_NAME(CLUSTERNAME) {
    return `cloud_init_node_${CLUSTERNAME}.sh`;
  }

  public static get_S3_CLOUD_INIT_SCRIPT(S3_LOCATION, CLUSTERNAME) {
    return `${S3_LOCATION}/${AppConfig.get_CLOUD_INIT_FILE_NAME(CLUSTERNAME)}`;
  }

  public static get_S3_RUN_NODE_SCRIPT(S3_LOCATION, CLUSTERNAME) {
    return `${S3_LOCATION}/cluster/run_node_${CLUSTERNAME}.sh`;
  }

  public static get_S3_JOB_ENVELOPE_SCRIPT(S3_LOCATION) {
    return `${S3_LOCATION}/cluster/job_envelope.sh`;
  }

  public static get_S3_QUEUE_UPDATE_SCRIPT(S3_LOCATION) {
    return `${S3_LOCATION}/cluster/queue_update.sh`;
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
