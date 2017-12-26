import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {RegionService} from '../region.service';
import {CredentialsCsvService} from '../csv.service';
import {Credentials} from 'aws-sdk';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  message: string;
  credentials: Credentials;

  availableRegions =  [];
  inProgress = false;

  constructor(public authService: AuthService, public router: Router, public regionService: RegionService,
              private csvService: CredentialsCsvService) {

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
    this.inProgress = true;
    this.message = 'Trying to log in ...';

    this.authService.login(this.credentials).subscribe((r) => {
      this.setMessage();
      this.inProgress = false;
      if (this.authService.isLoggedIn) {
        // Get the redirect URL from our auth service
        // If no redirect has been set, use the default
        const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '';

        // Redirect the user
        this.router.navigate([redirect]);
      }else {
        this.message = 'Login failed!';
      }
    });
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

    this.regionService.getAvailableRegions().subscribe( regions => {
      this.availableRegions = regions;
    });
  }

}
