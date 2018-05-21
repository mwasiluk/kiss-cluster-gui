import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


import { AssetsService } from './assets.service';

describe('AssetsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssetsService]
    });
  });

  it('should be created', inject([HttpTestingController, AssetsService], (service: AssetsService) => {
    expect(service).toBeTruthy();
  }));
});
