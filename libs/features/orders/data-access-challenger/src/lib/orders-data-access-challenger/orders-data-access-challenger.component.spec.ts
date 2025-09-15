import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersDataAccessChallengerComponent } from './orders-data-access-challenger.component';

describe('OrdersDataAccessChallengerComponent', () => {
  let component: OrdersDataAccessChallengerComponent;
  let fixture: ComponentFixture<OrdersDataAccessChallengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersDataAccessChallengerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersDataAccessChallengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
