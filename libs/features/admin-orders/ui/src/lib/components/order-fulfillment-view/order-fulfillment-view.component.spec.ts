import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFulfillmentViewComponent } from './order-fulfillment-view.component';

describe('OrderFulfillmentViewComponent', () => {
  let component: OrderFulfillmentViewComponent;
  let fixture: ComponentFixture<OrderFulfillmentViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderFulfillmentViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderFulfillmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
