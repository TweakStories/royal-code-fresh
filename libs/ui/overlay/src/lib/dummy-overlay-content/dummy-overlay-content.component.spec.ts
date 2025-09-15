import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyOverlayContentComponent } from './dummy-overlay-content.component';

describe('DummyOverlayContentComponent', () => {
  let component: DummyOverlayContentComponent;
  let fixture: ComponentFixture<DummyOverlayContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DummyOverlayContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DummyOverlayContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
