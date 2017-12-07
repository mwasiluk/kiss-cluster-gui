import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {Form, FormsModule} from '@angular/forms';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatCardModule, MatPaginatorModule, MatToolbarModule, MatSortModule} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';

import { AppRoutingModule } from './app-routing.module';
import {ClustersModule} from './clusters/clusters.module';

import { AppComponent } from './app.component';
import { SpotFleetListComponent } from './spot-fleet-list/spot-fleet-list.component';
import {SpotFleetService} from './spot-fleet.service';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    SpotFleetListComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatPaginatorModule, MatToolbarModule, MatSortModule,
    ClustersModule,
    AppRoutingModule
  ],
  providers: [SpotFleetService],
  bootstrap: [AppComponent]
})
export class AppModule { }
