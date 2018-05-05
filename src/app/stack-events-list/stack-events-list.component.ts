import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {RegionService} from '../region.service';
import {BaseListComponent} from '../base-list/base-list.component';
import {NotificationsService} from 'angular2-notifications';
import * as AWS from 'aws-sdk';
import {CloudFormationService} from '../cloud-formation.service';

@Component({
  selector: 'app-stack-events-list',
  templateUrl: './stack-events-list.component.html',
  styleUrls: ['./stack-events-list.component.scss']
})
export class StackEventsListComponent extends BaseListComponent<AWS.CloudFormation.StackEvent> implements OnInit, OnDestroy, AfterViewInit {

  events: AWS.CloudFormation.StackEvent[];

  displayedColumns = ['Timestamp', 'ResourceStatus', 'ResourceType', 'LogicalResourceId'];


  constructor(private router: Router, private cloudFormationService: CloudFormationService, protected regionService: RegionService,
              private notificationsService: NotificationsService) {
    super(regionService);
  }

  loadData(): Observable<AWS.CloudFormation.StackEvent[]> {
    return this.cloudFormationService.describeStackEvents();
  }

  onLoaded(items: AWS.CloudFormation.StackEvent[]) {
    this.events = items;
  }

  onLoadingError(e: any) {
    this.notificationsService.error('Error loading clusters', e.message);
    this.events = [];
  }

  getEvents(startImmediatelly = false): void {
    this.getItems(startImmediatelly);
  }
}
