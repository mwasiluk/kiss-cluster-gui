import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HelpDialogComponent} from './help-dialog/help-dialog.component';
import {AboutDialogComponent} from './about-dialog/about-dialog.component';
import {RegionService} from './region.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
  title = 'KissCluster';
  availableRegions = [];
  outputS3 = 's3://kissc-ohio/';

  public notificationOptions = {
    position: ['bottom', 'right'],
    timeOut: 7000,
    lastOnBottom: true,
    showProgressBar: true,
    pauseOnHover: true,
    theClass: 'notification'
  };

  constructor(private router: Router, public dialog: MatDialog, public authService: AuthService, public regionService: RegionService) {}

  ngOnInit(): void {

    this.setAvailableRegions();
    this.regionService.subscribe(r => setTimeout(() => {
      if (this.authService.isLoggedIn) {
        this.router.navigate(['/dashboard']);
      }

    }, 200));
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

  private setAvailableRegions() {

    this.regionService.getAvailableRegions().subscribe( regions => {
      this.availableRegions = regions;
    });
  }
}
