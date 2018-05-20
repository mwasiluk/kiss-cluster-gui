import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {Job} from './job';

import * as AWS from 'aws-sdk';
import {AppConfig} from '../app-config';
import {RegionService} from '../region.service';
import {NotificationsService} from 'angular2-notifications';
import {CrudBaseService} from '../crud-base.service';
import {UtilsService} from '../utils.service';

@Injectable()
export class JobService extends CrudBaseService<Job> {

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected utilsService: UtilsService) {
    super(notificationsService, regionService, utilsService);
  }

  map(data: any): Job {
    return AWS.DynamoDB.Converter.unmarshall(data);
  }

  getJobKey(jobid, queueid): AWS.DynamoDB.Key {
    return {jobid: {S:  jobid}, queueid: queueid};
  }

  getItemKey(item: Job): AWS.DynamoDB.Key {
    return this.getJobKey(item.jobid, item.queueid);
  }

  getCreateTableInput(clustername): AWS.DynamoDB.CreateTableInput {
    return {
      TableName: this.getTableName(clustername),
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
        ReadCapacityUnits: AppConfig.JOBS_TABLE_ReadCapacityUnits,
        WriteCapacityUnits: AppConfig.JOBS_TABLE_WriteCapacityUnits
      }
    };
  }

  getNewItem(data: any, ...args: any[]): Job {
    return data;
  }

  getShortDescription(item: Job, ...args: any[]): string {
    return `job node id: ${item.jobid}, queue id: ${item.queueid}`;
  }

  getJobs(clustername): Observable<Job[]> {
    return this.getJobsForCluster(clustername);
  }


  getTableName(clustername) {
    return AppConfig.JOBS_TABLE_NAME_PREFIX + clustername;
  }

  getJobsForCluster(clustername): Observable<Job[]> {
    return this.getAll(clustername);
  }
}

