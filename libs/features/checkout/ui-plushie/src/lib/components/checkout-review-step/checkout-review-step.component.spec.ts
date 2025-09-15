import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutReviewStepComponent } from './checkout-review-step.component';

describe('CheckoutReviewStepComponent', () => {
  let component: CheckoutReviewStepComponent;
  let fixture: ComponentFixture<CheckoutReviewStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutReviewStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutReviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
