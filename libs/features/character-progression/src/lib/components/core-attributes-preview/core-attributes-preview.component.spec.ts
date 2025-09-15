import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreAttributesPreviewComponent } from './core-attributes-preview.component';

describe('CoreAttributesPreviewComponent', () => {
  let component: CoreAttributesPreviewComponent;
  let fixture: ComponentFixture<CoreAttributesPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreAttributesPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreAttributesPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
