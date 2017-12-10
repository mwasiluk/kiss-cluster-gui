import { Component } from '@angular/core';
import {AuthService} from './auth.service';

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

  constructor(public authService: AuthService) {}

  showBreadcrumb() {
    return this.authService.isLoggedIn;
  }

}
