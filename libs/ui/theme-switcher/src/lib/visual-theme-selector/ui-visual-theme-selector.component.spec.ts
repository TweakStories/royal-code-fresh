import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiVisualThemeSelectorComponent } from './ui-visual-theme-selector.component';

describe('UiVisualThemeSelectorComponent', () => {
  let component: UiVisualThemeSelectorComponent;
  let fixture: ComponentFixture<UiVisualThemeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiVisualThemeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiVisualThemeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
