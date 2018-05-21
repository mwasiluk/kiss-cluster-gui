import { TestBed, inject } from '@angular/core/testing';

import { UtilsService } from './utils.service';

xdescribe('UtilsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilsService]
    });
  });

  it('should be created', inject([UtilsService], (service: UtilsService) => {
    expect(service).toBeTruthy();
  }));
});
