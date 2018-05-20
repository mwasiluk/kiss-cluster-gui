
import {forkJoin as observableForkJoin, Observable, of} from 'rxjs';
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfig} from './app-config';
import {flatMap} from 'rxjs/operators';

@Injectable()
export class AssetsService {


  public cache = {};

  constructor(private http: HttpClient) { }

  public get(assetName: string, responseType = 'text'): Observable<string> {
    if (this.cache[assetName]) {
      return of(this.cache[assetName]);
    }

    return this.http.get(`assets/${assetName}`, {responseType: responseType as 'text'}).pipe(flatMap(data => {
      this.cache[assetName] = data;
      return of(data);
    }));
  }

  public getAllScripts(): Observable<any> {
    return observableForkJoin(AppConfig.SCRIPT_NAMES.map(s => this.get(`sh/${s}`))).pipe(flatMap(r => of(this.cache)));
  }

}
