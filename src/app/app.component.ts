import { Component } from '@angular/core';
import {AuthService} from './auth.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HelpDialogComponent} from './help-dialog/help-dialog.component';
import {AboutDialogComponent} from "./about-dialog/about-dialog.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'KissCluster';
  region = 'us-east-2';
  availableRegions = ['us-east-1', 'us-east-2'];
  outputS3 = 's3://kissc-ohio/';

  constructor(public dialog: MatDialog, public authService: AuthService) {}

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
}
