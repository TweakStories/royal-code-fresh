import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScalabilityRoadmapComponent } from './scalability-roadmap.component';

describe('ScalabilityRoadmapComponent', () => {
  let component: ScalabilityRoadmapComponent;
  let fixture: ComponentFixture<ScalabilityRoadmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScalabilityRoadmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScalabilityRoadmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
