
import {interval as observableInterval, Observable, of, ReplaySubject, forkJoin} from 'rxjs';

import {switchMap, map, takeUntil, flatMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';

import {NotificationsService} from 'angular2-notifications';
import {RegionService} from './region.service';
import {UtilsService} from './utils.service';
import * as AWS from 'aws-sdk';
import * as ResourceGroupsTaggingAPI from 'aws-sdk/clients/resourcegroupstaggingapi';

import {AppConfig} from './app-config';
import {AssetsService} from './assets.service';
import * as _ from 'lodash';


@Injectable()
export class CloudFormationService {

  cf: AWS.CloudFormation;
  lambda: AWS.Lambda;
  resourceGroupsTagging: ResourceGroupsTaggingAPI;


  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected assetsService: AssetsService) {
    this.regionService.subscribe(r => this.initAWS());
    this.initAWS();
  }

  protected initAWS() {
    this.cf = new AWS.CloudFormation({
      credentials: AWS.config.credentials,
      region: AWS.config.region
      // endpoint: AWS.config.apigateway.endpoint
    });
    this.lambda = new AWS.Lambda({
      credentials: AWS.config.credentials,
      region: AWS.config.region
      // endpoint: AWS.config.apigateway.endpoint
    });
    this.resourceGroupsTagging = new ResourceGroupsTaggingAPI({
      credentials: AWS.config.credentials,
      region: AWS.config.region
      // endpoint: AWS.config.apigateway.endpoint
    });

  }

  /* createAndUpdateStack(): Observable<any> {
   return this.createStack().flatMap()
   //   .flatMap(r => {
   //   return this.updateStack();
   // });
   }
   */
  createStack(withUpdate = true): Observable<any> {
    const createOb = this.assetsService.get('kissCloudFormation.yaml').pipe(flatMap(templateBody => {
      return new Observable<any>(observer => {
        this.cf.createStack({
          StackName: AppConfig.STACK_NAME,
          TemplateBody: templateBody,
          // TemplateURL: 'https://s3.us-east-2.amazonaws.com/szufel-public/kissRoleS3.yaml',
          Capabilities: ['CAPABILITY_IAM']

        }, (err, data) => {
          if (err) {
            err.message = 'CloudFormation.createStack - ' + err.message;
            console.log(err, data);
            observer.error(err);
            return;
          }

          const finished = new ReplaySubject(1);
          observableInterval(5000).pipe(takeUntil(finished),
            switchMap(() => {
              return this.describeStacks();
            }), map(stacks => {
            return stacks;
          })).subscribe(stacks => {
            const stack = stacks[0];
            if (stack.StackStatus !== 'CREATE_IN_PROGRESS') {
              finished.next(true);
              finished.complete();
              if (stack.StackStatus === 'CREATE_COMPLETE') {
                this.notificationsService.info('Cloud formation success ...');
                observer.next(data.StackId);
                observer.complete();
              } else {
                const message = 'Cloud formation error: ' + stack.StackStatus;
                observer.error(message);
              }
            }
          }, e => {
            observer.error(e);
          });
        });
      });
    }));

    if (!withUpdate) {
      return createOb;
    }

    return createOb.pipe(flatMap(r => this.updateStack()));
  }

  updateStack(): Observable<any> {
    const changeSetName = AppConfig.CHANGE_SET_NAME;

    return this.assetsService.get('kissCloudFormationUpdate.yaml').pipe(flatMap(templateBody => {
      return new Observable<any>(observer => {
        this.cf.createChangeSet({
          ChangeSetName: changeSetName,
          StackName: AppConfig.STACK_NAME,
          TemplateBody: templateBody,
          // TemplateURL: 'https://s3.us-east-2.amazonaws.com/szufel-public/kissRoleS3.yaml',
          Capabilities: ['CAPABILITY_IAM']

        }, (err, data) => {
          console.log('createChangeSet', err, data);
          if (err) {
            err.message = 'CloudFormation.createChangeSet - ' + err.message;
            console.log(err, data);
            observer.error(err);
            return;
          }

          const finished = new ReplaySubject(1);
          observableInterval(5000).pipe(takeUntil(finished),
            switchMap(() => {
              return this.describeChangeSet(changeSetName);
            })).subscribe(cs => {
            if (cs.ExecutionStatus === 'AVAILABLE') {
              finished.next(true);
              finished.complete();
              observer.next(data);
              observer.complete();
            } else if (cs.Status === 'FAILED') {
              finished.next(true);
              finished.complete();
              const message = 'Cloud formation error: ' + cs.Status;
              observer.error(message);
            }
            console.log(cs);
          }, e => {
            observer.error(e);
          });

        });
      });
    })).pipe(flatMap(r => {
      return new Observable(observer => {
        this.cf.executeChangeSet({
          ChangeSetName: changeSetName,
          StackName: AppConfig.STACK_NAME,
        }, (err, data) => {
          if (err) {
            err.message = 'CloudFormation.executeChangeSet - ' + err.message;
            console.log(err, data);
            observer.error(err);
            return;
          }

          const finished = new ReplaySubject(1);
          observableInterval(5000).pipe(takeUntil(finished),
            switchMap(() => {
              return this.describeStacks();
            }), map(stacks => {
            return stacks;
          })).subscribe(stacks => {
            const stack = stacks[0];
            if (stack.StackStatus === 'UPDATE_COMPLETE') {
              finished.next(true);
              finished.complete();
              observer.next(data);
              observer.complete();
            }else if (['UPDATE_IN_PROGRESS', 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS'].indexOf(stack.StackStatus) < 0) {
              const message = 'Cloud formation update error: ' + stack.StackStatus;
              observer.error(message);
            }
          }, e => {
            observer.error(e);
          });

        });
      });
    }));
  }

  checkIfStackExists(): Observable<boolean> {
    return this.describeStacks(true).pipe(map(stacks => {
      return !!_.find(stacks, s => s.StackName === AppConfig.STACK_NAME);
    }));
  }

  describeStacks(all = false): Observable<AWS.CloudFormation.Stacks> {
    return new Observable(observer => {
      const params = {};

      if (!all) {
        params['StackName'] = AppConfig.STACK_NAME;
      }

      this.cf.describeStacks(params, (err, data) => {
        if (err) {
          err.message = 'CloudFormation.describeStacks - ' + err.message;
          console.log(err, data);
          observer.error(err);
          return;
        }
        observer.next(data.Stacks);
        observer.complete();

      });
    });
  }

  deleteStack(): Observable<boolean> {
    return new Observable(observer => {
      this.cf.deleteStack({
        StackName: AppConfig.STACK_NAME
      }, (err, data) => {
        if (err) {
          err.message = 'CloudFormation.deleteStack - ' + err.message;
          console.log(err, data);
          observer.error(err);
          return;
        }
        const finished = new ReplaySubject(1);
        observableInterval(2000).pipe(takeUntil(finished),
          switchMap(() => {
          return this.describeStacks();
        }), map(stacks => {
          return stacks;
        })).subscribe(stacks => {
          const stack = stacks[0];
          if (!stack.StackStatus.includes('_IN_PROGRESS')) {
            finished.next(true);
            finished.complete();
            if (stack.StackStatus === 'DELETE_COMPLETE') {
              observer.next(true);
              observer.complete();
            } else {
              const message = 'Delete stack error: ' + stack.StackStatus;
              observer.error(message);
            }
          }
        }, e => {
          if (e.message.includes('does not exist') && e.code === 'ValidationError') {
            observer.next(true);
            observer.complete();
          }else {
            console.log(e.message, e.code);
            observer.error(e);
          }
        });

      });
    });
  }

  describeStackEvents(): Observable<AWS.CloudFormation.StackEvents> {
    return new Observable(observer => {
      this.cf.describeStackEvents({
        StackName: AppConfig.STACK_NAME
      }, (err, data) => {
        if (err) {
          err.message = 'CloudFormation.describeStackEvents - ' + err.message;
          console.log(err, data);
          observer.error(err);
          return;
        }
        observer.next(data.StackEvents);
        observer.complete();

      });
    });
  }

  describeChangeSet(changeSetName = 'CreateLambdaCS'): Observable<AWS.CloudFormation.DescribeChangeSetOutput> {
    return new Observable(observer => {
      this.cf.describeChangeSet({
        StackName: AppConfig.STACK_NAME,
        ChangeSetName: changeSetName
      }, (err, data) => {
        if (err) {
          err.message = 'CloudFormation.describeChangeSet - ' + err.message;
          console.log(err, data);
          observer.error(err);
          return;
        }
        observer.next(data);
        observer.complete();

      });
    });
  }

  createLambda(): Observable<any> {
    return this.assetsService.get('kisscLambda.zip', 'arraybuffer').pipe(flatMap(zipFile => {
      return new Observable(observer => {
        this.lambda.createFunction({
          FunctionName: 'kisscLambda',
          Runtime: 'nodejs8.10',
          Role: '',
          Handler: 'index.handler',
          Code: {
            ZipFile: zipFile
            // S3Bucket: 's3://kissc-public/kisscLambda.zip'
          },
          MemorySize: 128,
          Timeout: 10
        }, (err, data) => {
          console.log(err, data);
          if (err) {
            err.message = 'Lambda.createFunction - ' + err.message;
            observer.error(err);
            return;
          }
          observer.next(data);
          observer.complete();

        });
      });
    }));
  }


  fetchLambdaInfo(): Observable<any> {



    return new Observable(observer => {

      this.resourceGroupsTagging.getResources({
        ResourceTypeFilters: ['lambda:function'],
        TagFilters: [{
          Key: 'kissc',
          Values: ['kissc-lambda']
        }]
      }, (err, data) => {
        if (err) {
          err.message = 'ResourceGroupsTagging.getResources - ' + err.message;
          console.log(err, data);
          observer.error(err);
          return;
        }

        if (data.ResourceTagMappingList.length < 1) {
          observer.error('Lambda function not found!');
          return;
        }
        const arn = data.ResourceTagMappingList[0].ResourceARN;
        const fn = arn.split(':function:')[1];

        console.log('Lambda function name: ' + fn);

        this.lambda.invoke({
          FunctionName: fn
        }, (err, data) => {
          console.log(err, data);
          if (err) {
            err.message = 'Lambda.invoke - ' + err.message;
            observer.error(err);
            return;
          }
          const d = JSON.parse(<string>data.Payload);
          d['InstanceProfiles'] = d['InstanceProfiles'] as AWS.IAM.InstanceProfile[];
          d['FunctionName'] = fn;
          observer.next(d);
          observer.complete();

        });
      });

    });
  }

  getCloudFormationConsoleUrl() {
    return AppConfig.getCloudFormationConsoleUrl(this.regionService.region);
  }

}

