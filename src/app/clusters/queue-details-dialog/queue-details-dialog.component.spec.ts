import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueDetailsDialogComponent } from './queue-details-dialog.component';

xdescribe('QueueDetailsDialogComponent', () => {
  let component: QueueDetailsDialogComponent;
  let fixture: ComponentFixture<QueueDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueueDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
