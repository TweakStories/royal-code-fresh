import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderManagementPageComponent } from './order-management-page.component';

describe('OrderManagementPageComponent', () => {
  let component: OrderManagementPageComponent;
  let fixture: ComponentFixture<OrderManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderManagementPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
