import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartEmptyStateComponent } from './cart-empty-state.component';

describe('CartEmptyStateComponent', () => {
  let component: CartEmptyStateComponent;
  let fixture: ComponentFixture<CartEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartEmptyStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
