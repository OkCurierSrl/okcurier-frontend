import { TestBed } from '@angular/core/testing';

import { ServicePricingService } from './service-pricing.service';

describe('ServicePricingService', () => {
  let service: ServicePricingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicePricingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
