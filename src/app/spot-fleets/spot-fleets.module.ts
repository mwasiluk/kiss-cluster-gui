import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
  MatTableModule, MatToolbarModule, MatSortModule, MatDialogModule, MatProgressSpinnerModule, MatExpansionModule,
  MatSnackBarModule, MatSelectModule
} from '@angular/material';
import {SpotFleetListComponent} from './spot-fleet-list/spot-fleet-list.component';
import {SpotFleetService} from './spot-fleet.service';
import {RouterModule} from '@angular/router';
import { SpotFleetDialogComponent } from './spot-fleet-dialog/spot-fleet-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatPaginatorModule, MatToolbarModule, MatSortModule, MatDialogModule, MatProgressSpinnerModule, MatExpansionModule,
    MatSnackBarModule, MatSelectModule,
    RouterModule
  ],
  declarations: [
    SpotFleetListComponent,
    SpotFleetDialogComponent,
  ],
  entryComponents: [
    SpotFleetDialogComponent
  ],
  providers: [
    SpotFleetService,
  ],
  exports: [
    SpotFleetListComponent
  ]
})
export class SpotFleetsModule {

}
