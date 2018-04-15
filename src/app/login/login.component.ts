import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {RegionService} from '../region.service';
import {CredentialsCsvService} from '../csv.service';
import {Credentials} from 'aws-sdk';
import {forEach} from '@angular/router/src/utils/collection';
import {NotificationsService} from 'angular2-notifications';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {CloudFormationService} from '../cloud-formation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  message: string;
  credentials: Credentials;

  availableRegions = [];
  inProgress = 0;

  constructor(public authService: AuthService, public router: Router, public regionService: RegionService,
              private csvService: CredentialsCsvService, protected notificationsService: NotificationsService, private cloudFormationService: CloudFormationService) {

  }

  ngOnInit(): void {
    this.credentials = null;
    this.setMessage();
    this.setAvailableRegions();
  }

  setMessage() {
    this.message = this.authService.isLoggedIn ? 'You are logged in' : 'Please provide credentials CSV file to login.';
  }

  login() {
    this.inProgress++;
    this.message = 'Trying to log in ...';

    this.authService.login(this.credentials).finally(() => this.inProgress--).subscribe((r) => {
      this.setMessage();
      if (this.authService.isLoggedIn) {
        // Get the redirect URL from our auth service
        // If no redirect has been set, use the

        const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '';

        // Redirect the user
        if (redirect) {
          const {url, params} = this.getUrlParams(redirect);

          this.router.navigate([url.pathname], {queryParams: params});
        } else {
          this.router.navigate([redirect]);
        }

      } else {
        this.message = 'Login failed!';
      }
    }, e => {
      this.message = 'Login failed!';
      this.notificationsService.error(e.message);
    });
  }

  initCloud() {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    this.inProgress++;
    this.message = 'Cloud formation creation in progress... It may take a few minutes.';

    this.authService.initCloud(this.credentials).finally(() => this.inProgress--).subscribe((r) => {
      this.message = 'Cloud formation success ... Logging in...';
      this.notificationsService.success('Cloud formation success ... Logging in...');
      this.login();
    }, e => {
      this.message = 'Cloud formation failed!';
      this.notificationsService.error(e.message);
    });
  }

  private getUrlParams(redirect: string) {
    const url = new URL(redirect, 'http://dummy.pl');
    const params = {};
    if (url.search) {

      url.search.replace('?', '').split('&').forEach(p => {
        const s = p.split('=', 2);

        if (s.length === 1) {
          params[s[0]] = '';
        } else {
          params[s[0]] = decodeURIComponent(s[1].replace(/\+/g, ' '));
        }
      });
    }
    return {url, params};
  }

  logout() {
    this.authService.logout();
    this.setMessage();
  }

  fileSelected(file) {
    this.csvService.parse(file).then(credentials => {
      this.credentials = credentials;
    });
  }

  setAvailableRegions() {

    this.regionService.getAvailableRegions().subscribe(regions => {
      this.availableRegions = regions;
    });
  }

}
