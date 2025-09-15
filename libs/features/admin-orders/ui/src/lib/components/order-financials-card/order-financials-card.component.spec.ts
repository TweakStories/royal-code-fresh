import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFinancialsCardComponent } from './order-financials-card.component';

describe('OrderFinancialsCardComponent', () => {
  let component: OrderFinancialsCardComponent;
  let fixture: ComponentFixture<OrderFinancialsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderFinancialsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderFinancialsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
