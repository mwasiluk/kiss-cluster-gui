import { TestBed, inject } from '@angular/core/testing';

import { AuthGuard } from './auth-guard.service';
import {AssetsService} from './assets.service';
import {AuthService} from './auth.service';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';


describe('AuthGuard', () => {

  let authServiceStub: Partial<AuthService>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard, {provide: AuthService, useValue: authServiceStub }]
    });
  });

  it('should be created', inject([AuthGuard], (service: AuthGuard) => {
    expect(service).toBeTruthy();
  }));
});
