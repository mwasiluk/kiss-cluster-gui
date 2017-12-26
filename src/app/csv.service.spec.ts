import { TestBed, inject } from '@angular/core/testing';

import { CredentialsCsvService } from './csv.service';

describe('CredentialsCsvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CredentialsCsvService]
    });
  });

  it('should be created', inject([CredentialsCsvService], (service: CredentialsCsvService) => {
    expect(service).toBeTruthy();
  }));
});
