import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafetyGateComponent } from './safety-gate.component';

describe('SafetyGateComponent', () => {
  let component: SafetyGateComponent;
  let fixture: ComponentFixture<SafetyGateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafetyGateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SafetyGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
