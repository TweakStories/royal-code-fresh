import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityBadgeComponent } from './availability-badge.component';

describe('AvailabilityBadgeComponent', () => {
  let component: AvailabilityBadgeComponent;
  let fixture: ComponentFixture<AvailabilityBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilityBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
