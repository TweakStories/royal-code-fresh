import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewsUiChallengerComponent } from './reviews-ui-challenger.component';

describe('ReviewsUiChallengerComponent', () => {
  let component: ReviewsUiChallengerComponent;
  let fixture: ComponentFixture<ReviewsUiChallengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsUiChallengerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsUiChallengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
