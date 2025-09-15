import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiMediaGalleryComponent } from './ui-media-gallery.component';

describe('UiMediaGalleryComponent', () => {
  let component: UiMediaGalleryComponent;
  let fixture: ComponentFixture<UiMediaGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMediaGalleryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiMediaGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
