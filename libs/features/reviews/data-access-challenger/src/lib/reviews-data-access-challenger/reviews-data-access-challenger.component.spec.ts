import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewsDataAccessChallengerComponent } from './reviews-data-access-challenger.component';

describe('ReviewsDataAccessChallengerComponent', () => {
  let component: ReviewsDataAccessChallengerComponent;
  let fixture: ComponentFixture<ReviewsDataAccessChallengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsDataAccessChallengerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsDataAccessChallengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
