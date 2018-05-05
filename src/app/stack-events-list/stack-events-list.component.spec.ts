import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackEventsListComponent } from './stack-events-list.component';

describe('StackEventsListComponent', () => {
  let component: StackEventsListComponent;
  let fixture: ComponentFixture<StackEventsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackEventsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackEventsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
