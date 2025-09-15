import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiFeaturedMediaGalleryComponent } from './ui-featured-media-gallery.component';

describe('UiFeaturedMediaGalleryComponent', () => {
  let component: UiFeaturedMediaGalleryComponent;
  let fixture: ComponentFixture<UiFeaturedMediaGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiFeaturedMediaGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiFeaturedMediaGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
