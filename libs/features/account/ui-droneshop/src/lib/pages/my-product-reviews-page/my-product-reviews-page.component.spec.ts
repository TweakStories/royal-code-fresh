import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProductReviewsPageComponent } from './my-product-reviews-page.component';

describe('MyProductReviewsPageComponent', () => {
  let component: MyProductReviewsPageComponent;
  let fixture: ComponentFixture<MyProductReviewsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProductReviewsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProductReviewsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
