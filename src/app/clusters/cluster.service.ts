import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';

import {Cluster} from './cluster';
import {CLUSTERS} from './mock-clusters';
import * as AWS from 'aws-sdk';
import {NotificationsService} from 'angular2-notifications';
import {DatePipe} from '@angular/common';
import {RegionService} from '../region.service';
import {QueueService} from './queue.service';
import {UtilsService} from './utils.service';
import {AppConfig} from '../app-config';
import {NodeService} from './node.service';
import {JobService} from './job.service';
import {message} from 'aws-sdk/clients/sns';
import {queue} from "rxjs/scheduler/queue";


@Injectable()
export class ClusterService {

  db: AWS.DynamoDB;
  private readCapacityUnits: any;
  private writeCapacityUnits: any;

  constructor(private notificationsService: NotificationsService, private regionService: RegionService,
              private queueService: QueueService, private nodeService: NodeService, private jobService: JobService, private utilsService: UtilsService) {

    this.readCapacityUnits = 2;
    this.writeCapacityUnits = 2;
    this.regionService.subscribe(r => this.initAWS());
    this.initAWS();
  }
  public static getClusterKey(clustername: string): AWS.DynamoDB.Key {
    return {clustername: {S: clustername}};
  }

  public static getTableName(): string {
    return AppConfig.CLUSTERS_TABLE_NAME;
  }
  private initAWS() {
    this.db = new AWS.DynamoDB({
      credentials: AWS.config.credentials,
      region: AWS.config.region
    });
  }





  getClusters(): Observable<Cluster[]> {

    return new Observable(observer => {

      this.db.scan({
        TableName: ClusterService.getTableName()
      }, (err, data) => {
        observer.next(data.Items.map(this.mapCluster));
        observer.complete();

      });
    });

  }

  getCluster(name: string): Observable<Cluster> {

    return new Observable(observer => {

      this.db.getItem({
        TableName: ClusterService.getTableName(),
        Key: ClusterService.getClusterKey(name)
      }, (err, data) => {
        if (err || !data.Item) {
          observer.next(null);
          observer.complete();
          return;
        }
        const cluster = this.mapCluster(data.Item);
        console.log(data.Item, cluster);
        observer.next(cluster);
        observer.complete();

      });
    });
  }

  createTable(): Observable<boolean> {
    return new Observable(observer => {
      this.db.createTable({
        TableName: ClusterService.getTableName(),
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
          ReadCapacityUnits: this.readCapacityUnits,
          WriteCapacityUnits: this.writeCapacityUnits
        }
      }, (err, data) => {
        if (data && data.TableDescription && data.TableDescription.TableName) {
          this.db.waitFor('tableExists', {TableName: ClusterService.getTableName()}, (err2, data2) => {
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
          observer.next(false);
        }
      });
    });
  }

  createTableIfNotExists(): Observable<boolean> {

    return this.checkIfTableExists().flatMap(r => {
      if (r) {
        console.log(ClusterService.getTableName() + ' DynamoDB table already exists.');
        return of(true);
      }
      console.log(ClusterService.getTableName() + ' DynamoDB table not exists. Creating...');
      return this.createTable();
    });

  }

  checkIfTableExists(): Observable<boolean> {
    return new Observable(observer => {
      this.db.describeTable({
        TableName: ClusterService.getTableName()
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

  mapCluster(data: any): Cluster {
    return AWS.DynamoDB.Converter.unmarshall(data);
  }

  marshallCluster(q: Cluster): AWS.DynamoDB.AttributeMap {
    return AWS.DynamoDB.Converter.marshall(q);
  }

  createCluster(cluster: Cluster): Observable<Cluster> {

    return this.getCluster(cluster.clustername).flatMap(c => {
      if (c) {
        this.notificationsService.error(`The cluster ${cluster.clustername} already exist. Please use a different cluster name or delete the cluster first`);
        return of(null);
      }

      cluster.S3_location = cluster.$s3_bucket + '/' + cluster.clustername;
      cluster.publickey = '-';
      cluster.privatekey = '-';
      cluster.date = this.utilsService.transformDate(new Date());

      let message = `Setting the counters and configuration for ${cluster.clustername}`;
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
        return of(null);
      }

      // TODO upload to s3

      cluster.nodeid = 0;
      cluster.queueid = 0;
      cluster.S3_node_init_script = AppConfig.get_S3_CLOUD_INIT_SCRIPT(cluster.S3_location, cluster.clustername);
      cluster.S3_run_node_script = AppConfig.get_S3_RUN_NODE_SCRIPT(cluster.S3_location, cluster.clustername);
      cluster.S3_job_envelope_script = AppConfig.get_S3_JOB_ENVELOPE_SCRIPT(cluster.S3_location);
      cluster.S3_queue_update_script = AppConfig.get_S3_QUEUE_UPDATE_SCRIPT(cluster.S3_location);
      cluster.workers_in_a_node = AppConfig.WORKERS_IN_A_NODE;
      cluster.creator = this.utilsService.getCreator();


      return new Observable(observer => {
        this.db.putItem({
          TableName: ClusterService.getTableName(),
          Item:  this.marshallCluster(cluster)
        }, (err, data) => {
          if (err) {
            console.log('Error putting item', err);
            observer.next(null);
          }else {
            console.log(data);
            observer.next(cluster);
          }

          observer.complete();
        });
      });
    });



  }



}

