import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatPaginatorModule,
  MatTableModule, MatToolbarModule, MatSortModule, MatDialogModule, MatProgressSpinnerModule, MatExpansionModule,
  MatSnackBarModule, MatSelectModule, MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule
} from '@angular/material';

import {SpotFleetListComponent} from './spot-fleet-list/spot-fleet-list.component';
import {SpotFleetService} from './spot-fleet.service';
import {RouterModule} from '@angular/router';
import { SpotFleetDialogComponent } from './spot-fleet-dialog/spot-fleet-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatButtonModule, MatCheckboxModule, MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatPaginatorModule, MatToolbarModule, MatSortModule, MatDialogModule, MatProgressSpinnerModule, MatExpansionModule,
    MatSnackBarModule, MatSelectModule, MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule,
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
