import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReviewFilterComponent } from './admin-review-filter.component';

describe('AdminReviewFilterComponent', () => {
  let component: AdminReviewFilterComponent;
  let fixture: ComponentFixture<AdminReviewFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReviewFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReviewFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
