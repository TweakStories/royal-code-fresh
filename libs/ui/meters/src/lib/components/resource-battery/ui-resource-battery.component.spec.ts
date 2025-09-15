import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiResourceBatteryComponent } from './ui-resource-battery.component';

describe('UiResourceBatteryComponent', () => {
  let component: UiResourceBatteryComponent;
  let fixture: ComponentFixture<UiResourceBatteryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiResourceBatteryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiResourceBatteryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
