import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotFleetListComponent } from './spot-fleet-list.component';

describe('SpotFleetListComponent', () => {
  let component: SpotFleetListComponent;
  let fixture: ComponentFixture<SpotFleetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpotFleetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotFleetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
