import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewEditPageComponent } from './review-edit-page.component';

describe('ReviewEditPageComponent', () => {
  let component: ReviewEditPageComponent;
  let fixture: ComponentFixture<ReviewEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewEditPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
