import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import 'rxjs/add/operator/mergeMap';

import {Queue} from './queue';
import * as AWS from 'aws-sdk';
import {Cluster} from './cluster';
import {DatePipe} from '@angular/common';
import {NotificationsService} from 'angular2-notifications';
import {RegionService} from '../region.service';
import {UtilsService} from './utils.service';
import {ClusterService} from './cluster.service';
import {AppConfig} from '../app-config';
import {S3Service} from './s3.service';


@Injectable()
export class QueueService {

  db: AWS.DynamoDB;
  s3: AWS.S3;

  private readCapacityUnits: any; // TODO move to config
  private writeCapacityUnits: any;

  constructor(private notificationsService: NotificationsService, private regionService: RegionService,
              private utilsService: UtilsService, private s3Service: S3Service) {

    this.regionService.subscribe(r => this.initAWS());
    this.initAWS();

  }

  private initAWS() {
    this.db = new AWS.DynamoDB({
      credentials: AWS.config.credentials,
      region: AWS.config.region
    });

    this.s3 = new AWS.S3({
      credentials: AWS.config.credentials,
      region: AWS.config.region
    });
  }

  getTableName(clustername) {
    return AppConfig.QUEUES_TABLE_NAME_PREFIX + clustername;
  }

  createTableIfNotExists(clustername): Observable<boolean> {
    const tableName = this.getTableName(clustername);
    return this.checkIfTableExists(clustername).flatMap(r => {
      if (r) {

        console.log(tableName + ' DynamoDB table already exists.');
        return of(true);
      }
      console.log(tableName + ' DynamoDB table not exists. Creating...');
      return this.createTable(clustername);
    });

  }

  checkIfTableExists(clustername): Observable<boolean> {
    const tableName = this.getTableName(clustername);
    return new Observable(observer => {
      this.db.describeTable({
        TableName: tableName
      }, (err, data) => {
        console.log(err, data);
        if (data && data.Table && data.Table.TableName) {
          observer.next(true);

        }else {
          observer.next(false);
        }
        observer.complete();

      });
    });

  }

  createTable(clustername): Observable<boolean> {
    const tableName = this.getTableName(clustername);
    return new Observable(observer => {
      this.db.createTable({
        TableName: tableName,
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
      }, (err, data) => {
        if (data && data.TableDescription && data.TableDescription.TableName) {
          this.db.waitFor('tableExists', {TableName: tableName}, (err2, data2) => {
            if (err2) {
              console.log(err2);
              observer.next(false);
            }else {
              observer.next(true);
            }
            observer.complete();
          });
        }else {
          console.log('Error creating table ', err);
          this.notificationsService.error(`Error creating ${tableName} DynamoDB table: ${err.message}`);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  getQueues(clustername): Observable<Queue[]> {
    return this.getQueuesForCluster(clustername);
  }




  getQueuesForCluster(clustername): Observable<Queue[]> {

    return new Observable(observer => {

      this.db.scan({
        TableName: this.getTableName(clustername)
      }, (err, data) => {
        observer.next(data.Items.map(this.mapQueue));
        observer.complete();

      });
    });
  }

  getQueue(id: string, clustername: string): Observable<Queue> {
    return new Observable(observer => {

      this.db.getItem({
        TableName: this.getTableName(clustername),
        Key: {queueid: {S: id}}
      }, (err, data) => {
        const item = this.mapQueue(data.Item);
        console.log(data.Item, item);
        observer.next(item);
        observer.complete();

      });
    });

  }

  mapQueue(data: any): Queue {
    return AWS.DynamoDB.Converter.unmarshall(data);
  }

  marshallQueue(q: Queue): AWS.DynamoDB.AttributeMap {
    return AWS.DynamoDB.Converter.marshall(q);
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

        console.log(err, data);

        observer.next(parseInt(data.Attributes.queueid.N));
        observer.complete();

      });
    });
  }

  printQueueID(queue): string {
    return 'Q' + String(queue.queueId).padStart(6, '0') + '_' + queue.queue_name;
  }

  createQueue(queue: Queue, cluster: Cluster): Observable<Queue> {

    return this.getNewQueueId(cluster).flatMap(queueId => {
      queue.queueid = queueId;
      const queueIdF = this.printQueueID(queue);


      const queueFilesDir = `/${cluster.clustername}/${queueIdF}`;
      queue.S3_location = queue.$S3_bucket + queueFilesDir;


      this.notificationsService.info(`Creating a queue ${queueIdF} at ${queue.S3_location}`);
      const appFolder = queue.S3_location + '/app';
      this.notificationsService.info('Deleting S3 folder ' + appFolder);

      return this.s3Service.emptyBucket(queue.$S3_bucket, queueFilesDir).flatMap(r => {
        if (!r) {
          console.log('App files upload failed');
          this.notificationsService.error('Deleting S3 folder failed!');
        }
        // TODO upload app files

        return of(r);
      });

    }).flatMap(result => {


      queue.qstatus = 'created';
      queue.date = this.utilsService.transformDate(new Date());
      queue.creator = this.utilsService.getCreator();
      queue.jobid = queue.minjobid - 1;

      return new Observable(observer => {
        this.db.putItem({
          TableName: this.getTableName(cluster.clustername),
          Item:  this.marshallQueue(queue)
        }, (err, data) => {
          if (err) {
            console.log('Error putting item', err);
            observer.next(null);
          }else {
            console.log(data);
            observer.next(queue);
          }

          observer.complete();
        });
      });

    });

  }

  getNewQueueForCluster(cluster: Cluster): Queue {
    return {
      $S3_bucket: cluster.S3_location,
      minjobid: AppConfig.MINJOBID,
      maxjobid: AppConfig.MAXJOBID
    };
  }

}

