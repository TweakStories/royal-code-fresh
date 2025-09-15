import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneExplanationPageComponent } from './drone-explanation-page.component';

describe('DroneExplanationPageComponent', () => {
  let component: DroneExplanationPageComponent;
  let fixture: ComponentFixture<DroneExplanationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneExplanationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneExplanationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
