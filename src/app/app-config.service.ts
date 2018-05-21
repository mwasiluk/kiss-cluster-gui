import {forkJoin as observableForkJoin, Observable, of} from 'rxjs';
import { Injectable } from '@angular/core';
import {AppConfig} from './app-config';
import {flatMap, map} from 'rxjs/operators';
import {AssetsService} from './assets.service';

@Injectable()
export class AppConfigService {


  constructor(private assetsService: AssetsService) {}

  getConfig(): Observable<AppConfig> {
    return this.assetsService.get('app-config.json').pipe(map(str => JSON.parse(str))).pipe(map(o => new AppConfig(o)));
  }

}
