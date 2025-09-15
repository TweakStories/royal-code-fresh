import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { challengeDetailResolver } from './challenge-detail.resolver';

describe('challengeDetailResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => challengeDetailResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
