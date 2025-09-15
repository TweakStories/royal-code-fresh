import { TestBed } from '@angular/core/testing';

import { AbstractReviewsApiService } from './abstract-reviews-api.service';

describe('AbstractReviewsApiService', () => {
  let service: AbstractReviewsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbstractReviewsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
