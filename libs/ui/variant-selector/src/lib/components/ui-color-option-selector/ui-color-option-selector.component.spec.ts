import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiColorOptionSelectorComponent } from './ui-color-option-selector.component';

describe('UiColorOptionSelectorComponent', () => {
  let component: UiColorOptionSelectorComponent;
  let fixture: ComponentFixture<UiColorOptionSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiColorOptionSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiColorOptionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
