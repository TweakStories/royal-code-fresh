import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiBarSegmentComponent } from './ui-bar-segment.component';

describe('UiBarSegmentComponent', () => {
  let component: UiBarSegmentComponent;
  let fixture: ComponentFixture<UiBarSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiBarSegmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiBarSegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
