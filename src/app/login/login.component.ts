import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  message: string;
  credentialsFile: any;

  constructor(public authService: AuthService, public router: Router) {

  }

  ngOnInit(): void {
    this.credentialsFile = null;
    this.setMessage();
  }

  setMessage() {
    this.message = this.authService.isLoggedIn ? 'You are logged in' : 'Please provide credentials CSV file to login.';
  }

  login() {
    this.message = 'Trying to log in ...';

    this.authService.login().subscribe(() => {
      this.setMessage();
      if (this.authService.isLoggedIn) {
        // Get the redirect URL from our auth service
        // If no redirect has been set, use the default
        const redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '';

        // Redirect the user
        this.router.navigate([redirect]);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.setMessage();
  }

  fileSelected(file) {
    const fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);

    const self = this;
    function receivedText(e) {
      self.credentialsFile = e.target.result;
    }
}

}
