import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutShippingStepComponent } from './checkout-shipping-step.component';

describe('CheckoutShippingStepComponent', () => {
  let component: CheckoutShippingStepComponent;
  let fixture: ComponentFixture<CheckoutShippingStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutShippingStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutShippingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
