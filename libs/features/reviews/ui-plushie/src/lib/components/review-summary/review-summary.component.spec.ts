import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductReviewSummaryComponent } from './review-summary.component';

describe('ProductReviewSummaryComponent', () => {
  let component: ProductReviewSummaryComponent;
  let fixture: ComponentFixture<ProductReviewSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductReviewSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductReviewSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
