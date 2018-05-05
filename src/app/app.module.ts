import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {Form, FormsModule} from '@angular/forms';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule, MatCheckboxModule, MatCardModule, MatPaginatorModule, MatToolbarModule, MatSortModule,
  MatSelectModule, MatMenuModule, MatDialogModule, MatProgressSpinnerModule, MatExpansionModule, MatTooltipModule
} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';

import { AppRoutingModule } from './app-routing.module';
import {ClustersModule} from './clusters/clusters.module';

import { AppComponent } from './app.component';
import { SpotFleetListComponent } from './spot-fleets/spot-fleet-list/spot-fleet-list.component';
import {SpotFleetService} from './spot-fleets/spot-fleet.service';
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
import {SimpleNotificationsModule} from 'angular2-notifications';
import {HttpClientModule} from '@angular/common/http';
import {AssetsService} from './assets.service';
import {DataService} from './data.service';
import {UtilsService} from './utils.service';
import {S3Service} from './s3.service';
import {SpotFleetsModule} from './spot-fleets/spot-fleets.module';
import {Ec2Service} from './ec2.service';
import {BaseListComponent} from "./base-list/base-list.component";
import {CloudFormationService} from "./cloud-formation.service";
import { CloudFormationDialogComponent } from './cloud-formation-dialog/cloud-formation-dialog.component';
import { StackEventsListComponent } from './stack-events-list/stack-events-list.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    HelpDialogComponent,
    AboutDialogComponent,
    BaseListComponent,
    CloudFormationDialogComponent,
    StackEventsListComponent
  ],
  entryComponents: [HelpDialogComponent, AboutDialogComponent, CloudFormationDialogComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,  MatExpansionModule,
    MatPaginatorModule, MatToolbarModule, MatSortModule, MatSelectModule, MatMenuModule, MatDialogModule, MatProgressSpinnerModule,
    MatTooltipModule,
    SimpleNotificationsModule.forRoot(),
    BreadcrumbsModule,
    ClustersModule,
    SpotFleetsModule,
    LoginRoutingModule,
    AppRoutingModule
  ],
  providers: [RegionService, CredentialsCsvService, AssetsService, DataService, UtilsService, S3Service, Ec2Service, CloudFormationService],
  bootstrap: [AppComponent]
})
export class AppModule {
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {

  }

}
