import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRecentReviewsComponent } from './dashboard-recent-reviews.component';

describe('DashboardRecentReviewsComponent', () => {
  let component: DashboardRecentReviewsComponent;
  let fixture: ComponentFixture<DashboardRecentReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardRecentReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardRecentReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
