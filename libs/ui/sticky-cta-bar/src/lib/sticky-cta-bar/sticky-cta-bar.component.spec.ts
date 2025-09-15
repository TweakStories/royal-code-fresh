import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StickyCtaBarComponent } from './sticky-cta-bar.component';

describe('StickyCtaBarComponent', () => {
  let component: StickyCtaBarComponent;
  let fixture: ComponentFixture<StickyCtaBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyCtaBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StickyCtaBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
