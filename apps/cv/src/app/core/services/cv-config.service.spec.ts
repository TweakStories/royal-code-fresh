import { TestBed } from '@angular/core/testing';

import { CvConfigService } from './cv-config.service';

describe('CvConfigService', () => {
  let service: CvConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CvConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
