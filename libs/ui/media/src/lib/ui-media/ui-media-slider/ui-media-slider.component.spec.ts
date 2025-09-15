import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMediaSliderComponent } from './ui-media-slider.component';

describe('UiMediaSliderComponent', () => {
  let component: UiMediaSliderComponent;
  let fixture: ComponentFixture<UiMediaSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMediaSliderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiMediaSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
