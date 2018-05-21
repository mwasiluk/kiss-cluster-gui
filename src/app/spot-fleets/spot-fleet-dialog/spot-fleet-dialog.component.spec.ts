import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotFleetDialogComponent } from './spot-fleet-dialog.component';

xdescribe('SpotFleetDialogComponent', () => {
  let component: SpotFleetDialogComponent;
  let fixture: ComponentFixture<SpotFleetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpotFleetDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotFleetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
