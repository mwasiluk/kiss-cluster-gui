import { TestBed, inject } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {RegionService} from "./region.service";
import {ClusterService} from "./clusters/cluster.service";

xdescribe('AuthService', () => {

  let regionServiceStub: Partial<RegionService>;
  let clusterServiceStub: Partial<ClusterService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, {provide: RegionService, useValue: regionServiceStub }]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
