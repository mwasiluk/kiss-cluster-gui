import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {Form, FormsModule} from '@angular/forms';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule, MatCheckboxModule, MatCardModule, MatPaginatorModule, MatToolbarModule, MatSortModule,
  MatSelectModule, MatMenuModule, MatDialogModule, MatProgressSpinnerModule
} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';

import { AppRoutingModule } from './app-routing.module';
import {ClustersModule} from './clusters/clusters.module';

import { AppComponent } from './app.component';
import { SpotFleetListComponent } from './spot-fleet-list/spot-fleet-list.component';
import {SpotFleetService} from './spot-fleet.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import {Router} from '@angular/router';
import {AuthGuard} from './auth-guard.service';
import {AuthService} from './auth.service';
import {LoginRoutingModule} from './login/login-routing.module';
import {BreadcrumbsModule} from 'ng2-breadcrumbs';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import {RegionService} from './region.service';
import {CredentialsCsvService} from './csv.service';
import {SimpleNotificationsModule} from "angular2-notifications";
import {HttpClientModule} from "@angular/common/http";
import {AssetsService} from "./assets.service";


@NgModule({
  declarations: [
    AppComponent,
    SpotFleetListComponent,
    DashboardComponent,
    LoginComponent,
    HelpDialogComponent,
    AboutDialogComponent
  ],
  entryComponents: [HelpDialogComponent, AboutDialogComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatPaginatorModule, MatToolbarModule, MatSortModule, MatSelectModule, MatMenuModule, MatDialogModule, MatProgressSpinnerModule,
    SimpleNotificationsModule.forRoot(),
    BreadcrumbsModule,
    ClustersModule,
    LoginRoutingModule,
    AppRoutingModule
  ],
  providers: [SpotFleetService, RegionService, CredentialsCsvService, AssetsService],
  bootstrap: [AppComponent]
})
export class AppModule {
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {

  }

}
