import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiPercentageBarComponent } from './ui-percentage-bar.component';

describe('UiPercentageBarComponent', () => {
  let component: UiPercentageBarComponent;
  let fixture: ComponentFixture<UiPercentageBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiPercentageBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiPercentageBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
