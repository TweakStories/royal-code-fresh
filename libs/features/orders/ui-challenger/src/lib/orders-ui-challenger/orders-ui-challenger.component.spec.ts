import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersUiChallengerComponent } from './orders-ui-challenger.component';

describe('OrdersUiChallengerComponent', () => {
  let component: OrdersUiChallengerComponent;
  let fixture: ComponentFixture<OrdersUiChallengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersUiChallengerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersUiChallengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
