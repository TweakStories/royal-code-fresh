import { TestBed } from '@angular/core/testing';

import { PlushieProductApiService } from './plushie-product-api.service';

describe('PlushieProductApiService', () => {
  let service: PlushieProductApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlushieProductApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
