import { TestBed } from '@angular/core/testing';

import { EmojiSelectionService } from './emoji-selection.service';

describe('EmojiSelectionService', () => {
  let service: EmojiSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmojiSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
