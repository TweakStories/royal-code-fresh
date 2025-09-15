import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { nodeDetailResolver } from './node-detail.resolver';

describe('nodeDetailResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => nodeDetailResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
