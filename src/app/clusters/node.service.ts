import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import {Node} from './node';

import * as AWS from 'aws-sdk';
import {ClusterService} from './cluster.service';
import {AppConfig} from '../app-config';
import {RegionService} from '../region.service';
import {NotificationsService} from 'angular2-notifications';

@Injectable()
export class NodeService {


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

  getNodes(clustername): Observable<Node[]> {
    return this.getNodesForCluster(clustername);
  }


  getTableName(clustername) {
    return AppConfig.NODES_TABLE_NAME_PREFIX + clustername;
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
            AttributeName: 'nodeid',
            AttributeType: 'N'
          }
        ],
        KeySchema: [{
          AttributeName: 'nodeid',
          KeyType: 'HASH'
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

  deleteTable(clustername): Observable<boolean> {
    const tableName = this.getTableName(clustername);
    return new Observable(observer => {
      this.db.deleteTable({
        TableName: tableName,
      }, (err, data) => {
        if (!err) {
          observer.next(true);
          observer.complete();
        }else {
          this.notificationsService.error(`Error deleting ${tableName} DynamoDB table: ${err.message}`);
          console.log('Error deleting table ', err);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  getNodesForCluster(clustername): Observable<Node[]> {

    return new Observable(observer => {

      this.db.scan({
        TableName: this.getTableName(clustername)
      }, (err, data) => {
        observer.next(data.Items.map(this.mapNode));
        observer.complete();

      });
    });
  }

  getNode(id: string, clustername: string): Observable<Node> {
    return new Observable(observer => {

      this.db.getItem({
        TableName: this.getTableName(clustername),
        Key: {nodeid: {S: id}}
      }, (err, data) => {
        const item = this.mapNode(data.Item);
        console.log(data.Item, item);
        observer.next(item);
        observer.complete();

      });
    });

  }

  mapNode(data: any): Node {
    return AWS.DynamoDB.Converter.unmarshall(data);
  }

  marshallQueue(q: Node): AWS.DynamoDB.AttributeMap {
    return AWS.DynamoDB.Converter.marshall(q);
  }

}

