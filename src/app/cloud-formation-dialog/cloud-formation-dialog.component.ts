import {Component, OnInit, Inject, OnDestroy, AfterViewInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {CloudFormationService} from '../cloud-formation.service';
import {NotificationsService} from 'angular2-notifications';
import {AppConfig} from '../app-config';
import * as AWS from 'aws-sdk';
import {ReplaySubject} from 'rxjs/ReplaySubject';

enum Status {
  INITIAL, CHECKING_IF_STACK_ALREADY_EXISTS, STACK_ALREADY_EXISTS, STACK_NOT_EXISTS, CREATION_IN_PROGRESS, DELETE_IN_PROGRESS, SUCCESS, ERROR
}

@Component({
  selector: 'app-cloud-formation-dialog',
  templateUrl: './cloud-formation-dialog.component.html',
  styleUrls: ['./cloud-formation-dialog.component.scss']
})

export class CloudFormationDialogComponent implements OnInit, OnDestroy, AfterViewInit {

  workInProgress = 0;
  Status = Status;
  status = Status.INITIAL;
  prevStatus = null;
  stackName = AppConfig.STACK_NAME;
  error = null;
  showEvents = false;

  timerFinished = null;
  timeToLogin = 30;

  constructor(
    public dialogRef: MatDialogRef<CloudFormationDialogComponent>, private cloudFormationService: CloudFormationService,
    protected notificationsService: NotificationsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.checkIfExists();
  }

  checkIfExists() {
    this.workInProgress++;
    this.status = Status.CHECKING_IF_STACK_ALREADY_EXISTS;

    this.cloudFormationService.checkIfStackExists().finally(() => this.workInProgress--).subscribe(res => {
      if (res) {
        this.status = Status.STACK_ALREADY_EXISTS;
        // this.status = Status.CREATION_IN_PROGRESS;


      } else {
        this.status = Status.STACK_NOT_EXISTS;
      }

    }, e => {
      this.notificationsService.error(e.message);
      this.prevStatus = this.status;
      this.status = Status.ERROR;
      this.error = e;
    });

    // this.cloudFormationService.createStack().flatMap(r => {
    //   console.log(r);
    //   if (r) {
    //     return Observable.of(true);
    //   }
    //   return Observable.of(false);
    // });
    // this.authService.initCloud(this.credentials).finally(() => this.inProgress--).subscribe((r) => {
    //   this.message = 'Cloud formation success ... Logging in...';
    //   this.notificationsService.success('Cloud formation success ... Logging in...');
    //   this.login();
    // }, e => {
    //   this.message = 'Cloud formation failed!';
    //   this.notificationsService.error(e.message);
    // });
  }

  initCloud() {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    this.workInProgress++;
    this.status = Status.CREATION_IN_PROGRESS;

    this.cloudFormationService.createStack().map(r => {
      console.log(r);
      return !!r;
    }).finally(() => {
      this.workInProgress--;
      this.showEvents = false;
    }).subscribe((r) => {
      this.notificationsService.success('Cloud formation success...');
      this.status = Status.SUCCESS;
      this.launchLoginTimer(this.timeToLogin);
    }, e => {
      this.error = e;
      this.prevStatus = this.status;
      this.status = Status.ERROR;
      this.notificationsService.error(e.message);
    });
  }

  closeAfterSuccess() {
    this.dialogRef.close(true);
  }

  pollStackEvents() {
    setTimeout(() => {
      this.showEvents = true;
    }, 500);
  }

  deleteStack() {

    if (!window.confirm('Are you sure?')) {
      return;
    }

    this.workInProgress++;
    this.status = Status.DELETE_IN_PROGRESS;

    this.cloudFormationService.deleteStack().finally(() => {
      this.workInProgress--;
      this.showEvents = false;
    }).subscribe((r) => {
      this.notificationsService.success('Stack deletion success...');
      this.status = Status.STACK_NOT_EXISTS;
    }, e => {
      this.error = e;
      this.prevStatus = this.status;
      this.status = Status.ERROR;
      this.notificationsService.error(e.message);
    });
  }

  getCloudFormationConsoleUrl(): string {
    return this.cloudFormationService.getCloudFormationConsoleUrl();
  }

  launchLoginTimer(time = 11) {
    this.timerFinished = new ReplaySubject(1);

    Observable.interval(1000).takeUntil(this.timerFinished)
      .take(time)
      .map((v) => (time - 1) - v)
      .finally(() => this.closeAfterSuccess())
      .subscribe(v => this.timeToLogin = v);
  }


  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    if (this.timerFinished){
      this.timerFinished.next(true);
      this.timerFinished.complete();
    }

  }
}
