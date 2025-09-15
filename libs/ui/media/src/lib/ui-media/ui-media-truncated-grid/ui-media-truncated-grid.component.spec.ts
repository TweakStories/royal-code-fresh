import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMediaTruncatedGridComponent } from './ui-media-truncated-grid.component';

describe('UiMediaTruncatedGridComponent', () => {
  let component: UiMediaTruncatedGridComponent;
  let fixture: ComponentFixture<UiMediaTruncatedGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMediaTruncatedGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiMediaTruncatedGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
