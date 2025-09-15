import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderActionsCardComponent } from './order-actions-card.component';

describe('OrderActionsCardComponent', () => {
  let component: OrderActionsCardComponent;
  let fixture: ComponentFixture<OrderActionsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderActionsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderActionsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
