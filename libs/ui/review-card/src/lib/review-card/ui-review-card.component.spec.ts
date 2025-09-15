import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiReviewCardComponent } from './ui-review-card.component';

describe('UiReviewCardComponent', () => {
  let component: UiReviewCardComponent;
  let fixture: ComponentFixture<UiReviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiReviewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiReviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
