import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandingThemeSelectorComponent } from './expanding-theme-selector.component';

describe('ExpandingThemeSelectorComponent', () => {
  let component: ExpandingThemeSelectorComponent;
  let fixture: ComponentFixture<ExpandingThemeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandingThemeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpandingThemeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
