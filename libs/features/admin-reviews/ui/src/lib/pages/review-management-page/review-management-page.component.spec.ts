import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewManagementPageComponent } from './review-management-page.component';

describe('ReviewManagementPageComponent', () => {
  let component: ReviewManagementPageComponent;
  let fixture: ComponentFixture<ReviewManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewManagementPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
