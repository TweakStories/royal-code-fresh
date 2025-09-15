import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiProgressCircleComponent } from './ui-progress-circle.component';

describe('UiProgressCircleComponent', () => {
  let component: UiProgressCircleComponent;
  let fixture: ComponentFixture<UiProgressCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiProgressCircleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiProgressCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
