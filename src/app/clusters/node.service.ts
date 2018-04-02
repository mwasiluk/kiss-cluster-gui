import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import {Node} from './node';

import * as AWS from 'aws-sdk';
import {AppConfig} from '../app-config';
import {RegionService} from '../region.service';
import {NotificationsService} from 'angular2-notifications';
import {CrudBaseService} from '../crud-base.service';
import {UtilsService} from '../utils.service';
import {Ec2Service} from "../ec2.service";
import {Cluster} from "./cluster";

@Injectable()
export class NodeService  extends CrudBaseService<Node> {

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected utilsService: UtilsService, protected ec2Service: Ec2Service) {

    super(notificationsService, regionService, utilsService);

  }

  getTableName(clustername) {
    return AppConfig.NODES_TABLE_NAME_PREFIX + clustername;
  }

  getNodes(clustername, fetchInstanceInfo = false): Observable<Node[]> {
    return this.getNodesForCluster(clustername, fetchInstanceInfo);
  }

  getNodesForCluster(clustername, fetchInstanceInfo = false): Observable<Node[]> {
    const all = this.getAll(clustername);
    if (!fetchInstanceInfo) {
      return all;
    }
    return Observable.forkJoin([all, this.ec2Service.describeInstances()]).map(r => {
      let instances = <AWS.EC2.Reservation[]>r[1];

      const nodes = <Node[]>r[0];
      const nodesByInstanceId = {};
      nodes.forEach(n => {
        nodesByInstanceId[n.instance_id] = n;
      });
      instances.forEach(ir => {
         ir.Instances.forEach(i => {
           const n = nodesByInstanceId[i.InstanceId];
           if (n) {
             n.$instance = i;
           }
         });
      });

      return nodes;
    });
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

  getActiveCPUs(nodes: Node[]): number {
    if (!nodes) {
      return 0;
    }

    return nodes.reduce((prev, n) => prev + (Node.isActive(n) ? parseInt(n.nproc) : 0), 0);
  }

  getInstanceConsoleUrl(node: Node): string {
    return AppConfig.getInstanceConsoleUrl(this.regionService.region, node.instance_id);
  }

  getInstancesConsoleUrl(cluster: Cluster): string {
    return AppConfig.getSearchInstanceConsoleUrl(this.regionService.region, AppConfig.getNodeName(cluster));
  }

}

