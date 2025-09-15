import { TestBed } from '@angular/core/testing';

import { AiAvatarService } from './ai-avatar.service';

describe('AiAvatarService', () => {
  let service: AiAvatarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiAvatarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
