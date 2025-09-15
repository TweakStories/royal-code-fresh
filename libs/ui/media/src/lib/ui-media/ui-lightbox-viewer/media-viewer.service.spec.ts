import { TestBed } from '@angular/core/testing';

import { MediaViewerService } from '../_services/media-viewer.service';

describe('MediaViewerService', () => {
  let service: MediaViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
