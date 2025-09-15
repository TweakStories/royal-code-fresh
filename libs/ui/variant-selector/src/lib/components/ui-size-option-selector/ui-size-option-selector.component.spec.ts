import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiSizeOptionSelectorComponent } from './ui-size-option-selector.component';

describe('UiSizeOptionSelectorComponent', () => {
  let component: UiSizeOptionSelectorComponent;
  let fixture: ComponentFixture<UiSizeOptionSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSizeOptionSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiSizeOptionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
