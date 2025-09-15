import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMeterDisplayComponent } from './ui-meter-display.component';

describe('UiMeterDisplayComponent', () => {
  let component: UiMeterDisplayComponent;
  let fixture: ComponentFixture<UiMeterDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMeterDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiMeterDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
