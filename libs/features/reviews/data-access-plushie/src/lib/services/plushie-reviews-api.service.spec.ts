import { TestBed } from '@angular/core/testing';

import { PlushieReviewsApiService } from './plushie-reviews-api.service';

describe('PlushieReviewsApiService', () => {
  let service: PlushieReviewsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlushieReviewsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
