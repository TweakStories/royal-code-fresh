import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeskillsPreviewComponent } from './lifeskills-preview.component';

describe('LifeskillsPreviewComponent', () => {
  let component: LifeskillsPreviewComponent;
  let fixture: ComponentFixture<LifeskillsPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifeskillsPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeskillsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
