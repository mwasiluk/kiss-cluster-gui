
import {interval as observableInterval, Observable, ReplaySubject, Subscription} from 'rxjs';

import {switchMap, takeUntil, startWith} from 'rxjs/operators';
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {RegionService} from '../region.service';
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

  onLoadingError(e) {
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

    this.subscription = observableInterval(AppConfig.polling_interval).pipe(startWith(startImmediatelly ? 0 : AppConfig.polling_interval),
      takeUntil(this.destroyed$),
      switchMap(() => {
        this.workInProgress++;
        return this.loadData();
      }))
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
