import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeDetailsDialogComponent } from './node-details-dialog.component';

describe('NodeDetailsDialogComponent', () => {
  let component: NodeDetailsDialogComponent;
  let fixture: ComponentFixture<NodeDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
