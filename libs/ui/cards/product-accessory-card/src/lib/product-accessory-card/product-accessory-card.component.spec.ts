import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAccessoryCardComponent } from './product-accessory-card.component';

describe('ProductAccessoryCardComponent', () => {
  let component: ProductAccessoryCardComponent;
  let fixture: ComponentFixture<ProductAccessoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAccessoryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductAccessoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
