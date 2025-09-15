import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReviewFormComponent } from './admin-review-form.component';

describe('AdminReviewFormComponent', () => {
  let component: AdminReviewFormComponent;
  let fixture: ComponentFixture<AdminReviewFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReviewFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
