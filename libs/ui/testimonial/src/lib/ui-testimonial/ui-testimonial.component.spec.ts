import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiTestimonialComponent } from './ui-testimonial.component';

describe('UiTestimonialComponent', () => {
  let component: UiTestimonialComponent;
  let fixture: ComponentFixture<UiTestimonialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTestimonialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTestimonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
