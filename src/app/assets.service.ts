import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {AppConfig} from './app-config';

@Injectable()
export class AssetsService {


  public cache = {};

  constructor(private http: HttpClient) { }

  public get(assetName: string): Observable<string> {
    if (this.cache[assetName]) {
      return of(this.cache[assetName]);
    }

    return this.http.get(`assets/${assetName}`, {responseType: 'text'}).flatMap(data => {
      this.cache[assetName] = data;
      return of(data);
    });
  }

  public getAllScripts(): Observable<object> {
    return Observable.forkJoin(AppConfig.SCRIPT_NAMES.map(s => this.get(`sh/${s}`))).flatMap(r => of(this.cache));
  }

}
