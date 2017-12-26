import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import {Job} from './job';

import * as AWS from 'aws-sdk';
import {ClusterService} from './cluster.service';
import {AppConfig} from '../app-config';
import {RegionService} from '../region.service';
import {NotificationsService} from "angular2-notifications";

@Injectable()
export class JobService {

  db: AWS.DynamoDB;

  constructor(private notificationsService: NotificationsService, private regionService: RegionService) {

    this.regionService.subscribe(r => this.initAWS());
    this.initAWS();

  }

  private initAWS() {
    this.db = new AWS.DynamoDB({
      credentials: AWS.config.credentials,
      region: AWS.config.region
    });
  }

  getJobs(clustername): Observable<Job[]> {
    return this.getJobsForCluster(clustername);
  }


  getTableName(clustername) {
    return AppConfig.JOBS_TABLE_NAME_PREFIX + clustername;
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
          },
          {
            AttributeName: 'jobid',
            AttributeType: 'N'
          }
        ],
        KeySchema: [{
          AttributeName: 'queueid',
          KeyType: 'HASH'
        },
          {
            AttributeName: 'jobid',
            KeyType: 'RANGE'
          }],
        ProvisionedThroughput: {
          ReadCapacityUnits: AppConfig.NODES_TABLE_ReadCapacityUnits,
          WriteCapacityUnits: AppConfig.NODES_TABLE_WriteCapacityUnits
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
          this.notificationsService.error(`Error creating ${tableName} DynamoDB table: ${err.message}`);
          console.log('Error creating table ', err);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  getJobsForCluster(clustername): Observable<Job[]> {

    return new Observable(observer => {

      this.db.scan({
        TableName: this.getTableName(clustername)
      }, (err, data) => {
        observer.next(data.Items.map(this.mapJob));
        observer.complete();

      });
    });
  }

  getJob(id: string, clustername: string): Observable<Job> {
    return new Observable(observer => {

      this.db.getItem({
        TableName: this.getTableName(clustername),
        Key: {jobid: {S: id}}
      }, (err, data) => {
        const item = this.mapJob(data.Item);
        console.log(data.Item, item);
        observer.next(item);
        observer.complete();

      });
    });

  }

  mapJob(data: any): Job {
    return AWS.DynamoDB.Converter.unmarshall(data);
  }

  marshallJob(q: Job): AWS.DynamoDB.AttributeMap {
    return AWS.DynamoDB.Converter.marshall(q);
  }
}

