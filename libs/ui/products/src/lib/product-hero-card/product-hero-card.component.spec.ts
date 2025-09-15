import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductHeroCardComponent } from './product-hero-card.component';

describe('ProductHeroCardComponent', () => {
  let component: ProductHeroCardComponent;
  let fixture: ComponentFixture<ProductHeroCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductHeroCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductHeroCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
