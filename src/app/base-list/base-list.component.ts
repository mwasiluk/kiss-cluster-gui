import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {RegionService} from '../region.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/startWith';
import {Subscription} from 'rxjs/Subscription';
import {AppConfig} from '../app-config';

@Component({
  selector: 'app-base-list',
  templateUrl: './base-list.component.html',
  styleUrls: ['./base-list.component.scss']
})
export class BaseListComponent<T> implements OnInit, OnDestroy, AfterViewInit {

  displayedColumns = [];
  dataSource = new MatTableDataSource<T>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  protected subscription: Subscription;
  workInProgress = 0;

  constructor(protected regionService: RegionService) { }

  loadData(): Observable<T[]> {
    throw new Error('loadData method not implemented!');
  }

  onLoaded(items: T[]) {
    throw new Error('onLoaded method not implemented!');
  }

  onLoadingError(e){
    throw new Error('onLoadingError method not implemented!');
  }

  ngOnInit() {
    this.regionService.subscribe(r => this.getItems());
    this.getItems(true);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getItems(startImmediatelly = false): void {

    this.subscription = Observable.interval(AppConfig.polling_interval).startWith(startImmediatelly ? 0 : AppConfig.polling_interval)
      .takeUntil(this.destroyed$)
      .switchMap(() => {
        this.workInProgress++;
        return this.loadData();
      })
      .subscribe(items => {
        setTimeout(() => this.workInProgress--, 500);
        this.dataSource.data = items;
        this.onLoaded(items);
      }, e => {
        this.workInProgress--;
        this.dataSource.data = [];
        this.onLoadingError(e);
      });
  }

  refresh() {
    this.stop();
    this.getItems(true);
  }

  resetPolling() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.destroyed$ = new ReplaySubject(1);
    if (this.subscription != null && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  stop(): void {
    this.resetPolling();
  }

}
