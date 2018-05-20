
import {forkJoin as observableForkJoin, Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';


import * as AWS from 'aws-sdk';
import {NotificationsService} from 'angular2-notifications';
import {RegionService} from './region.service';
import {UtilsService} from './utils.service';
import {AppConfig} from "./app-config";


@Injectable()
export class S3Service {

  public bucketList: Array<string>;

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
        console.log('listed data: ', data);
        if (err) {
          console.log(err, err.code);
          observer.error(new Error(`Error listing objects to delete from S3: ${err.message}`));
          return;
        }


        if (!data.Contents.length) {
          observer.next(true);
          observer.complete();
          return;
        }

        const params = {
          Bucket: bucketName,
          Delete: {Objects: []}
        };


        data.Contents.forEach(function (content) {
          params.Delete.Objects.push({Key: content.Key});
        });

        this.s3.deleteObjects(params, (err2, data2) => {
          if (err2) {
            console.log(err2, err2.code);
            observer.error(new Error(`Error deleting object from S3: ${err2.message}`));
            return;
          }
          if (data2.Deleted.length === 1000) {
            return this.emptyBucket(bucketName, folder);
          }

          observer.next(true);
          observer.complete();
        });
      });
    });


  }

  putObject(bucketName, fileKey, fileBody): Observable<boolean> {
    const params = {
      Body: fileBody,
      Bucket: bucketName,
      Key: fileKey,
    };
    return new Observable(observer => {
      this.s3.putObject(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
          observer.error(new Error(`Error putting object to S3: ${err.message}`));
          return;
        } else   {
          console.log(data);           // successful response
          observer.next(true);
          observer.complete();
          return;
        }

      });
    });



    /*const params = {Bucket: bucketName, Key: 'key', Body: fileContent};
    this.s3.upload(params, function(err, data) {
      console.log(err, data);
    });*/
  }

  upload(bucketName, fileKey, fileBody): Observable<boolean> {
    const params = {
      Body: fileBody,
      Bucket: bucketName,
      Key: fileKey,
    };
    return new Observable(observer => {
      this.s3.upload(params, function(err, data) {
        if (err) {
          console.log('upload', fileKey, err, err.stack);
          observer.error(new Error(`Error uploading object to S3: ${err.message}`));
          return;
        } else   {
          console.log('upload', fileKey, data);           // successful response
          observer.next(true);
          observer.complete();
          return;
        }

      });
    });
  }

  uploadFiles(bucketName, fileKeyPrefix, files): Observable<Array<boolean>> {
    return observableForkJoin(Array.from(files)
      .map(file => this.upload(bucketName, `${fileKeyPrefix}/${(file['webkitRelativePath'] || '/').split('/').slice(1)}`, file)));
  }

  listBuckets(): Observable<Array<string>> {
    // console.log('listBuckets a', AWS.config.credentials.accessKeyId, 'sssss');

    return new Observable(observer => {

      this.s3.listBuckets(function(err, data) {
        console.log('listBuckets');
        if (err) {
          observer.error(new Error(`Error listing buckets from S3: ${err.message}`));
        } else   {
          console.log('listBuckets', data);           // successful response
          this.bucketList = data.Buckets.map(b => b.Name);
          observer.next(this.bucketList);
          observer.complete();
          return;
        }

      });
    });
  }

  getConsoleUrl(location, file = false): string {
    return AppConfig.S3_CONSOLE_URL + `/s3/${file ? 'object' : 'buckets'}/${location.replace('s3://', '')}${file ? '' : '/'}`;
  }

}

