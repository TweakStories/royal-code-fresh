import { TestBed } from '@angular/core/testing';

import { AbstractProductApiService } from './abstract-product-api.service';

describe('AbstractProductApiService', () => {
  let service: AbstractProductApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbstractProductApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
