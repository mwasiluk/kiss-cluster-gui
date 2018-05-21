
import {throwError as observableThrowError, Observable, of} from 'rxjs';
import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HelpDialogComponent} from './help-dialog/help-dialog.component';
import {AboutDialogComponent} from './about-dialog/about-dialog.component';
import {RegionService} from './region.service';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FileLoader} from './file-loader';
import {DataService} from './data.service';
import {S3Service} from './s3.service';
import {NotificationsService} from 'angular2-notifications';
import {ClusterService} from './clusters/cluster.service';
import {BreadcrumbsService} from 'ng2-breadcrumbs';
import {CloudFormationService} from './cloud-formation.service';
import {map, finalize} from 'rxjs/operators';
import {AppConfigService} from "./app-config.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
  title = 'KissCluster';
  availableRegions = [];
  workInProgress = false;

  public notificationOptions = {
    position: ['bottom', 'right'],
    timeOut: 10000,
    lastOnBottom: true,
    showProgressBar: true,
    pauseOnHover: true,
    theClass: 'notification'
  };

  constructor(private router: Router, public dialog: MatDialog, public authService: AuthService, public regionService: RegionService, private appConfigService: AppConfigService,
              private dataService: DataService, private s3Service: S3Service, private notificationsService: NotificationsService,
              private clusterService: ClusterService, private breadcrumbs: BreadcrumbsService, private cloudFormationService: CloudFormationService) {}

  ngOnInit(): void {

    this.breadcrumbs.storePrefixed({label: 'Home' , url: '/', params: []});
    this.workInProgress = true;
    this.appConfigService.getConfig().subscribe(conf => {
      this.workInProgress = false;
    })

    this.setAvailableRegions();
    this.regionService.subscribe(r => {
      if (this.authService.isLoggedIn) {
        console.log('region switched, checking dynamoDB db tables..');
        this.workInProgress = true;
        this.clusterService.initIfNotExists().pipe(map(res => {
          if (res) {
            return of(true);
          }else {
            return observableThrowError('Region switching error (Problem while creating the cluster DynamoDB table)');
          }
        })).pipe(finalize(() => {
          setTimeout(() => {
            this.workInProgress = false;
            this.router.navigate(['/']);
          }, 200);
        })).subscribe(res => {
          console.log('res', res);
        }, e => {
          this.notificationsService.error(e);
        });

      }

    });

    this.authService.subscribe(loggedIn => {
      console.log(loggedIn);
      if (!loggedIn) {
        this.router.navigate(['login']);
        return;
      }
    },  (err) => {
      console.log('Error: ' + err);
    }, () => {
      console.log('Completed');
    });

  }

  showBreadcrumb() {
    return this.authService.isLoggedIn;
  }

  openHelpDialog(): void {
    const dialogRef = this.dialog.open(HelpDialogComponent, {
      width: '500px',
      data: { }
    });
  }

  openAboutDialog(): void {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: '500px',
      data: { }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  openFile() {
    FileLoader.openFile(c => {
      const data = JSON.parse(c);
      console.log(data);
      this.dataService.clusterData = data;
      this.router.navigate(['./cluster/create']);

    });
  }

  private setAvailableRegions() {

    this.regionService.getAvailableRegions().subscribe( regions => {
      this.availableRegions = regions;
    });
  }
}
