import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewProfileComponent } from './review-author-profile.component';

describe('ReviewProfileComponent', () => {
  let component: ReviewProfileComponent;
  let fixture: ComponentFixture<ReviewProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
