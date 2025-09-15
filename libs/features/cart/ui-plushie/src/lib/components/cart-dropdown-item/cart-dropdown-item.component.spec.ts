import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartDropdownItemComponent } from './cart-dropdown-item.component';

describe('CartDropdownItemComponent', () => {
  let component: CartDropdownItemComponent;
  let fixture: ComponentFixture<CartDropdownItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartDropdownItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartDropdownItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
