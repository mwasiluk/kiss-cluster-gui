import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';

import {Queue} from './queue';
import * as AWS from 'aws-sdk';
import {Cluster} from './cluster';
import {NotificationsService} from 'angular2-notifications';
import {RegionService} from '../region.service';
import {UtilsService} from '../utils.service';
import {AppConfig} from '../app-config';
import {S3Service} from '../s3.service';
import {CrudBaseService} from '../crud-base.service';


@Injectable()
export class QueueService extends CrudBaseService<Queue> {

  s3: AWS.S3;

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected utilsService: UtilsService, private s3Service: S3Service) {

    super(notificationsService, regionService, utilsService);

  }

  protected initAWS() {
    super.initAWS();

    this.s3 = new AWS.S3({
      credentials: AWS.config.credentials,
      region: AWS.config.region
    });
  }


  map(data: any): Queue {
    return AWS.DynamoDB.Converter.unmarshall(data);
  }

  mapQueue(data: any): Queue {
    return this.map(data);
  }

  getQueueKey(id): AWS.DynamoDB.Key {
    return {queueid: {S: id}};
  }

  getItemKey(item: Queue): AWS.DynamoDB.Key {
    return this.getQueueKey(item.queueid);
  }

  getCreateTableInput(clustername): AWS.DynamoDB.CreateTableInput {
    return {
      TableName: this.getTableName(clustername),
      AttributeDefinitions: [
        {
          AttributeName: 'queueid',
          AttributeType: 'N'
        }
      ],
      KeySchema: [{
        AttributeName: 'queueid',
        KeyType: 'HASH'
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: AppConfig.QUEUES_TABLE_ReadCapacityUnits,
        WriteCapacityUnits: AppConfig.QUEUES_TABLE_WriteCapacityUnits
      }
    };
  }

  getNewItem(data: any): Queue {
    return data;
  }

  getNewQueueForCluster(cluster: Cluster): Queue {
    console.log('getNewQueueForCluster', Cluster.getS3Bucket(cluster.S3_location));
    return {
      $S3_bucket: Cluster.getS3Bucket(cluster.S3_location),
      minjobid: AppConfig.MINJOBID,
      maxjobid: AppConfig.MAXJOBID
    };
  }

  getShortDescription(item: Queue): string {
    return `queue ${this.printQueueID(item)}`;
  }


  getTableName(clustername) {
    return AppConfig.QUEUES_TABLE_NAME_PREFIX + clustername;
  }

  getQueues(clustername): Observable<Queue[]> {
    return this.getQueuesForCluster(clustername);
  }

  getQueuesForCluster(clustername): Observable<Queue[]> {
    return this.getAll(clustername);
  }


  getQueue(id: string, clustername: string): Observable<Queue> {
    return this.get(this.getQueueKey(id), clustername);
  }

  getNewQueueId(cluster: Cluster): Observable<number> {
    return new Observable(observer => {

      const tableName = AppConfig.CLUSTERS_TABLE_NAME;
      console.log('tableName', tableName);
      this.db.updateItem({
        TableName: tableName,
        Key: {clustername: {S: cluster.clustername}},
        UpdateExpression: 'SET queueid = queueid + :incr',
        ExpressionAttributeValues: {':incr': {'N': '1'}},
        ReturnValues: 'UPDATED_NEW'

      }, (err, data) => {

        if (err || !data){
          return Observable.throw(err);
        }
        console.log('getNewQueueId', err, data, data.Attributes.queueid.N);

        observer.next(parseInt(data.Attributes.queueid.N));
        observer.complete();

      });
    });
  }

  printQueueID(queue: Queue): string {
    return 'Q' + (String(queue.queueid)).padStart(6, '0') + '_' + queue.queue_name;
  }

  createQueue(queue: Queue, cluster: Cluster, appFiles): Observable<Queue> {

    return this.getNewQueueId(cluster).flatMap(queueId => {
      queue.queueid = queueId;
      const queueIdF = this.printQueueID(queue);



      const queueFilesDir = `${cluster.clustername}/${queueIdF}`;
      queue.S3_location = `s3://${queue.$S3_bucket}/${queueFilesDir}`;


      this.notificationsService.info(`Creating a queue ${queueIdF} at ${queue.S3_location}`);
      const appFolder = queueFilesDir + '/app';

      this.notificationsService.info('Deleting S3 folder ' + appFolder);

      return this.s3Service.emptyBucket(queue.$S3_bucket, appFolder).catch(e => {
          console.log('Deleting S3 folder failed!', e, e.code);
        this.notificationsService.warn('Deleting S3 folder failed!');
        return Observable.of(false);
      }).flatMap(r => {

        console.log('Uploading app files!');
        return Observable.forkJoin([
          this.s3Service.putObject(queue.$S3_bucket, `${appFolder}/job.sh`, `#!/bin/bash\n\n${queue.command} \$1`),
          this.s3Service.uploadFiles(queue.$S3_bucket, appFolder, appFiles)
        ]);
      });

    }).flatMap(result => {


      queue.qstatus = 'created';
      queue.date = this.utilsService.transformDate(new Date());
      queue.creator = this.utilsService.getCreator();
      queue.jobid = queue.minjobid - 1;

      return this.putItem(queue, cluster.clustername);

    });

  }




}

