
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';
import * as AWS from 'aws-sdk';
import {NotificationsService} from 'angular2-notifications';
import {RegionService} from './region.service';
import {UtilsService} from './utils.service';
import 'rxjs/add/observable/throw';
import {AppConfig} from "./app-config";



export abstract class CrudBaseService<E> {

  db: AWS.DynamoDB;

  constructor(protected notificationsService: NotificationsService, protected regionService: RegionService,
              protected utilsService: UtilsService) {

    this.regionService.subscribe(r => this.initAWS());
    this.initAWS();
  }

  public abstract getTableName(...args: any[]): string;

  abstract map(data: any, ...args): E;

  abstract getItemKey(item: E, ...args): AWS.DynamoDB.Key;

  abstract getCreateTableInput(...args): AWS.DynamoDB.CreateTableInput;

  abstract  getNewItem(data: any, ...args): E;


  protected initAWS() {
    this.db = new AWS.DynamoDB();
    AppConfig.updateAwsServiceConfig(this.db.config);
  }


  getAll(...args): Observable<E[]> {

    return new Observable(observer => {

      this.db.scan({
        TableName: this.getTableName(...args)
      }, (err, data) => {
        if (err) {
          err.message = 'DynamoDB.scan - ' + err.message;
          console.log(err.message);
          observer.error(err);
          return;
        }
        observer.next(data.Items.map(this.map));
        observer.complete();

      });
    });

  }

  getFromTable(tableName, key: AWS.DynamoDB.Types.Key): Observable<E> {

    return new Observable(observer => {

      this.db.getItem({
        TableName: tableName,
        Key: key
      }, (err, data) => {
        if (err) {
          err.message = 'DynamoDB.getItem - ' + err.message;
          observer.error(err);
          return;
        }else if (!data.Item) {
          observer.next(null);
          observer.complete();
          return;
        }

        const item = this.map(data.Item);
        console.log(data.Item, item);
        observer.next(item);
        observer.complete();

      });
    });
  }

  get(key: AWS.DynamoDB.Types.Key, ...args: any[]): Observable<E> {
    return this.getFromTable(this.getTableName(...args), key);
  }



  createTable(...args: any[]): Observable<boolean> {
    return new Observable(observer => {
      this.db.createTable(this.getCreateTableInput(...args), (err, data) => {
        if (data && data.TableDescription && data.TableDescription.TableName) {
          this.db.waitFor('tableExists', {TableName: this.getTableName(...args)}, (err2, data2) => {
            if (err2) {
              err2.message = 'DynamoDB.waitFor tableExists - ' + err2.message;
              console.log(err2, err2.code);
              observer.error(err2);
            }else {
              observer.next(true);
            }
            observer.complete();
          });
        }else {
          err.message = 'DynamoDB.createTable - ' + err.message;
          console.log('Error creating table ', err, err.code);
          observer.error(err);
        }
      });
    });
  }

  createTableIfNotExists(...args: any[]): Observable<boolean> {

    return this.checkIfTableExists().flatMap(r => {
      if (r) {
        console.log(this.getTableName(...args) + ' DynamoDB table already exists.');
        return of(true);
      }
      console.log(this.getTableName(...args) + ' DynamoDB table not exists. Creating...');
      return this.createTable();
    });

  }

  checkIfTableExists(...args: any[]): Observable<boolean> {
    return new Observable(observer => {
      this.db.describeTable({
        TableName: this.getTableName(...args)
      }, (err, data) => {
        console.log(err, data);
        if (err) {
          if (err.code === 'ResourceNotFoundException') {
            observer.next(false);
            observer.complete();
            return;
          }
          err.message = 'DynamoDB.describeTable - ' + err.message;
          console.log(err, err.code);
          observer.error(err);
          return;
        }
        if (data && data.Table && data.Table.TableName) {
          observer.next(true);

        }else {
          observer.next(false);
        }
        observer.complete();

      });
    });

  }

  marshallEntity(e: E): AWS.DynamoDB.AttributeMap {
    return AWS.DynamoDB.Converter.marshall(e);
  }

  abstract getShortDescription(item: E, ...args): string;

  deleteItem(item: E, ...args): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.db.deleteItem({
        TableName: this.getTableName(...args),
        Key: this.getItemKey(item)
      }, (err, data) => {
        if (err) {
          const msg = `Deleting ${this.getShortDescription(item, ...args)} from table ${this.getTableName(...args)} failed!`;
          // this.notificationsService.info(msg);
          err.message = 'DynamoDB.deleteItem - ' + err.message;
          console.log(msg, err.message);
          observer.error(msg);

          return;
        }

        console.log(`${this.getShortDescription(item, ...args)} deleted from table ${this.getTableName(...args)}`);
        observer.next(true);
        observer.complete();

      });
    });
  }

  dropTable(tableName: string): Observable<boolean> {
    return new Observable(observer => {
      this.db.deleteTable({
        TableName: tableName,
      }, (err, data) => {
        if (!err) {
          observer.next(true);
          observer.complete();
        }else {
          this.notificationsService.error(`Error deleting ${tableName} DynamoDB table: ${err.message}`);
          err.message = 'DynamoDB.deleteTable - ' + err.message;
          console.log('Error deleting table ', err, err.code);
          observer.error(err);
        }
      });
    });
  }

  deleteTable(...args): Observable<boolean> {
    return this.dropTable(this.getTableName(...args));
  }

  putItem(item: E, ...args): Observable<E> {
    console.log('putting item', item);
    return new Observable(observer => {
      this.db.putItem({
        TableName: this.getTableName(...args),
        Item:  this.marshallEntity(item)
      }, (err, data) => {
        if (err) {
          err.message = 'DynamoDB.putItem - ' + err.message;
          console.log('Error putting item', err, err.code);
          observer.error(err);
        }else {
          console.log(data);
          observer.next(item);
        }

        observer.complete();
      });
    });
  }
}

