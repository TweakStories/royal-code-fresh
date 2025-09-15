import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideStepComponent } from './guide-step.component';

describe('GuideStepComponent', () => {
  let component: GuideStepComponent;
  let fixture: ComponentFixture<GuideStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
