import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';

import {Cluster} from './cluster';
import {Node} from './node';
import * as AWS from 'aws-sdk';
import {NotificationsService} from 'angular2-notifications';
import {RegionService} from '../region.service';
import {QueueService} from './queue.service';
import {UtilsService} from '../utils.service';
import {AppConfig} from '../app-config';
import {NodeService} from './node.service';
import {JobService} from './job.service';
import {S3Service} from '../s3.service';
import {AssetsService} from '../assets.service';
import 'rxjs/add/observable/throw';
import {CrudBaseService} from '../crud-base.service';
import * as _ from "lodash";

@Injectable()
export class ClusterService extends CrudBaseService<Cluster> {

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              private queueService: QueueService, private nodeService: NodeService, private jobService: JobService,
              protected utilsService: UtilsService, private s3Service: S3Service, private assetsService: AssetsService) {
    super(notificationsService, regionService, utilsService);
  }

  public static getTableName(): string {
    return AppConfig.CLUSTERS_TABLE_NAME;
  }

  public static getClusterKey(clustername: string): AWS.DynamoDB.Key {
    return {clustername: {S: clustername}};
  }



  public getTableName(): string {
    return ClusterService.getTableName();
  }

  map(data: any): Cluster {
    return <Cluster>AWS.DynamoDB.Converter.unmarshall(data);
  }

  getItemKey(item: Cluster): AWS.DynamoDB.Key {
    return ClusterService.getClusterKey(item.clustername);
  }

  getCreateTableInput(): AWS.DynamoDB.CreateTableInput {
    return {
      TableName: this.getTableName(),
      AttributeDefinitions: [
        {
          AttributeName: 'clustername',
          AttributeType: 'S'
        }
      ],
      KeySchema: [{
        AttributeName: 'clustername',
        KeyType: 'HASH'
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: AppConfig.CLUSTERS_TABLE_ReadCapacityUnits,
        WriteCapacityUnits: AppConfig.CLUSTERS_TABLE_WriteCapacityUnits
      }
    };
  }

  getNewItem(data: any): Cluster {
    if (!data) {
      return {
        $s3_bucket: this.regionService.outputS3,
        username: 'ubuntu'
      };
    }

    return data;
  }

  getShortDescription(item: Cluster): string {
    return `Cluster: ${item.clustername}`;
  }

  getClusters(fetchNodes = false, fetchQueues = false): Observable<Cluster[]> {
    let c_;
    let res = this.getAll();
    if (fetchNodes || fetchQueues) {
      return res.flatMap(clusters => {
        c_ = clusters;
        if (!clusters.length) {
          return of(clusters);
        }

        const fork = [];
        clusters.forEach(c => {
          if (fetchNodes) {
            fork.push(this.nodeService.getNodes(c.clustername, true).map(nodes => {
              c.$nodes = nodes;
              c.$cpu = this.nodeService.getCPUs(nodes);
              c.$activeCPU = this.nodeService.getActiveCPUs(nodes);
              c.$activeNodes = nodes.filter(n => Node.isActive(n)).length;
              return nodes;
            }).catch(e => {
              console.log(e);
              return null;
            }));
          }
          if (fetchQueues) {
            fork.push(this.queueService.getQueues(c.clustername).map(queues => {
              c.$queues = queues;
              c.$currentQueue = _.find(queues, q => q.queueid === c.queueid);
              return queues;
            }));
          }
        });
        return Observable.forkJoin(fork);
      }).map(r => {
        return c_;
      });
    }

    return res;
  }

  getCluster(name: string): Observable<Cluster> {
    return this.get(ClusterService.getClusterKey(name));
  }

  deleteCluster(cluster: Cluster): Observable<boolean> {
    this.notificationsService.info(`Deleting the counters and configuration for ${cluster.clustername}`);

    return this.deleteItem(cluster).flatMap(r => {

      return Observable.forkJoin([
        this.nodeService.deleteTable(cluster.clustername),
        this.queueService.deleteTable(cluster.clustername),
        this.jobService.deleteTable(cluster.clustername)
      ]);
    }).flatMap(result => {
      console.log('dynamodb tables removed', result);
      if (!result || !result.every(r => r)) {
        return of(false);
      }
      return of(true);
    });
  }

  createCluster(cluster: Cluster): Observable<Cluster> {

    return this.getCluster(cluster.clustername).flatMap(c => {
      if (c) {
        const msg = `The cluster ${cluster.clustername} already exist. Please use a different cluster name or delete the cluster first`;
        // this.notificationsService.error(msg);
        return Observable.throw(msg);
      }

      cluster.S3_location = Cluster.getS3Location(cluster);
      cluster.publickey = '-';
      cluster.privatekey = '-';
      cluster.date = this.utilsService.transformDate(new Date());

      const message = `Setting the counters and configuration for ${cluster.clustername}`;
      this.notificationsService.info(message);
      console.log(message);

      return Observable.forkJoin([
        this.nodeService.createTable(cluster.clustername),
        this.queueService.createTable(cluster.clustername),
        this.jobService.createTable(cluster.clustername)
      ]);


    }).flatMap(result => {
      console.log('dynamodb tables created', result);
      if (!result || !result.every(r => r)) {
        return Observable.throw('Error creating DynamoDB tables');
      }

      return this.assetsService.getAllScripts();

    }).flatMap(scripts => {

      cluster.nodeid = 0;
      cluster.queueid = 0;
      cluster.S3_node_init_script = AppConfig.get_S3_CLOUD_INIT_SCRIPT(cluster.S3_location, cluster.clustername);
      cluster.S3_run_node_script = AppConfig.get_S3_RUN_NODE_SCRIPT(cluster.S3_location, cluster.clustername);
      cluster.S3_job_envelope_script = AppConfig.get_S3_JOB_ENVELOPE_SCRIPT(cluster.S3_location);
      cluster.S3_queue_update_script = AppConfig.get_S3_QUEUE_UPDATE_SCRIPT(cluster.S3_location);
      cluster.workers_in_a_node = AppConfig.WORKERS_IN_A_NODE;
      cluster.creator = this.utilsService.getCreator();

      return Observable.forkJoin([
        this.s3Service.putObject(cluster.$s3_bucket,
          `${Cluster.getS3KeyLocation(cluster)}/${AppConfig.get_CLOUD_INIT_FILE_NAME(cluster.clustername)}`,
          AppConfig.getCloudInitFileContent(this.regionService.region, cluster.S3_location, cluster.clustername, cluster.username, scripts['sh/cloud_init_template.sh'])),

        this.s3Service.putObject(cluster.$s3_bucket, AppConfig.get_S3_RUN_NODE_SCRIPT(Cluster.getS3KeyLocation(cluster), cluster.clustername), scripts['sh/run_node.sh']),
        this.s3Service.putObject(cluster.$s3_bucket, AppConfig.get_S3_JOB_ENVELOPE_SCRIPT(Cluster.getS3KeyLocation(cluster)), scripts['sh/job_envelope.sh']),
        this.s3Service.putObject(cluster.$s3_bucket, AppConfig.get_S3_QUEUE_UPDATE_SCRIPT(Cluster.getS3KeyLocation(cluster)), scripts['sh/queue_update.sh'])
      ]);
    }).flatMap(result => {
      return this.putItem(cluster);
    });

  }

  getCloudInitFileContent(cluster): Observable<string> {
    return this.assetsService.get('sh/cloud_init_template.sh')
      .map(script => AppConfig.getCloudInitFileContent(this.regionService.region, cluster.S3_location, cluster.clustername,
        cluster.username, script));

  }

  getNewCluster(data: any): Cluster {
    return this.getNewItem(data);
  }
}

