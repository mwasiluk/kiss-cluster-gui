import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import {Node} from './node';

import * as AWS from 'aws-sdk';
import {AppConfig} from '../app-config';
import {RegionService} from '../region.service';
import {NotificationsService} from 'angular2-notifications';
import {CrudBaseService} from '../crud-base.service';
import {UtilsService} from '../utils.service';

@Injectable()
export class NodeService  extends CrudBaseService<Node> {

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected utilsService: UtilsService) {

    super(notificationsService, regionService, utilsService);

  }

  getTableName(clustername) {
    return AppConfig.NODES_TABLE_NAME_PREFIX + clustername;
  }

  getNodes(clustername): Observable<Node[]> {
    return this.getNodesForCluster(clustername);
  }

  getNodesForCluster(clustername): Observable<Node[]> {
    return this.getAll(clustername);
  }

  getCreateTableInput(clustername): AWS.DynamoDB.CreateTableInput {
    return {
      TableName: this.getTableName(clustername),
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
    };
  }

  getNode(id: string, clustername: string): Observable<Node> {
    return this.get(this.getNodeKey(id), clustername);

  }

  map(data: any): Node {
    return AWS.DynamoDB.Converter.unmarshall(data);
  }

  getNodeKey(nodeid): AWS.DynamoDB.Key {
    return {nodeid: {S: nodeid}};
  }

  getItemKey(item: Node, ...args): AWS.DynamoDB.Key {
    return this.getNodeKey(item.nodeid);
  }

  getNewItem(data: any, ...args): Node {
    return data;
  }

  getShortDescription(item: Node): string {
    return `node ${item.nodeid}`;
  }

  getCPUs(nodes: Node[]): number {
    if (!nodes) {
      return 0;
    }

    return nodes.reduce((prev, n) => prev + parseInt(n.nproc), 0);
  }
}

