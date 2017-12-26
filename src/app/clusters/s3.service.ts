import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import 'rxjs/add/operator/mergeMap';

import * as AWS from 'aws-sdk';
import {NotificationsService} from 'angular2-notifications';
import {RegionService} from '../region.service';
import {UtilsService} from './utils.service';


@Injectable()
export class S3Service {


  s3: AWS.S3;

  constructor(private notificationsService: NotificationsService, private regionService: RegionService, private utilsService: UtilsService) {

    this.regionService.subscribe(r => this.initAWS());
    this.initAWS();

  }

  private initAWS() {


    this.s3 = new AWS.S3({
      credentials: AWS.config.credentials,
      region: AWS.config.region
    });
  }

  emptyBucket(bucketName, folder): Observable<boolean> {
    return new Observable(observer => {
      this.s3.listObjects({
        Bucket: bucketName,
        Prefix: folder
      }, (err, data) => {

        if (err) {
          console.log(err);
          observer.next(false);
          observer.complete();
          return;
        }


        if (!data.Contents.length) {
          observer.next(true);
          observer.complete();
        }

        const params = {
          Bucket: bucketName,
          Delete: {Objects: []}
        };


        data.Contents.forEach(function (content) {
          params.Delete.Objects.push({Key: content.Key});
        });

        this.s3.deleteObjects(params, (err, data) => {
          if (err) {
            console.log(err);
            observer.next(false);
            observer.complete();
            return;
          }
          if (data.Deleted.length === 1000) {
            return this.emptyBucket(bucketName, folder);
          }

          observer.next(true);
          observer.complete();
        });
      });
    });


  }

}

