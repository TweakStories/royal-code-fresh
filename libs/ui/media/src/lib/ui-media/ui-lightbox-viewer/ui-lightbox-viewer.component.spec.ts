import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiLightboxViewerComponent } from './ui-lightbox-viewer.component';

describe('UiLightboxViewerComponent', () => {
  let component: UiLightboxViewerComponent;
  let fixture: ComponentFixture<UiLightboxViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiLightboxViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiLightboxViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
