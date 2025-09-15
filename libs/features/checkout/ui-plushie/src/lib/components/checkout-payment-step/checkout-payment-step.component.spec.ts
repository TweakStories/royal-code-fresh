import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPaymentStepComponent } from './checkout-payment-step.component';

describe('CheckoutPaymentStepComponent', () => {
  let component: CheckoutPaymentStepComponent;
  let fixture: ComponentFixture<CheckoutPaymentStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPaymentStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutPaymentStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
