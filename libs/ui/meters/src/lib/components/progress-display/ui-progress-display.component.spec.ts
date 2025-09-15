import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiProgressDisplayComponent } from './ui-progress-display.component';

describe('UiProgressDisplayComponent', () => {
  let component: UiProgressDisplayComponent;
  let fixture: ComponentFixture<UiProgressDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiProgressDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiProgressDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
