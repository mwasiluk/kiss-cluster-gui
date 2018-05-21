import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudFormationDialogComponent } from './cloud-formation-dialog.component';

xdescribe('CloudFormationDialogComponent', () => {
  let component: CloudFormationDialogComponent;
  let fixture: ComponentFixture<CloudFormationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudFormationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudFormationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
