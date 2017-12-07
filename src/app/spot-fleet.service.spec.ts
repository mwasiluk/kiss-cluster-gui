import { TestBed, inject } from '@angular/core/testing';

import { SpotFleetService } from './spot-fleet.service';

describe('SpotFleetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpotFleetService]
    });
  });

  it('should be created', inject([SpotFleetService], (service: SpotFleetService) => {
    expect(service).toBeTruthy();
  }));
});
