import { TestBed } from '@angular/core/testing';

import { DateTimeUtil } from './date-time-util.service';

describe('DateTimeUtil', () => {
  let service: DateTimeUtil;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateTimeUtil);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
