import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiSegmentedBarComponent } from './ui-segmented-bar.component';

describe('UiSegmentedBarComponent', () => {
  let component: UiSegmentedBarComponent;
  let fixture: ComponentFixture<UiSegmentedBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSegmentedBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiSegmentedBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
