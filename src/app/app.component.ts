import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HelpDialogComponent} from './help-dialog/help-dialog.component';
import {AboutDialogComponent} from './about-dialog/about-dialog.component';
import {RegionService} from './region.service';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FileLoader} from './file-loader';
import {DataService} from "./data.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
  title = 'KissCluster';
  availableRegions = [];


  public notificationOptions = {
    position: ['bottom', 'right'],
    timeOut: 10000,
    lastOnBottom: true,
    showProgressBar: true,
    pauseOnHover: true,
    theClass: 'notification'
  };

  constructor(private router: Router, public dialog: MatDialog, public authService: AuthService, public regionService: RegionService, private dataService: DataService) {}

  ngOnInit(): void {

    this.setAvailableRegions();
    this.regionService.subscribe(r => setTimeout(() => {
      if (this.authService.isLoggedIn) {
        this.router.navigate(['/']);
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
