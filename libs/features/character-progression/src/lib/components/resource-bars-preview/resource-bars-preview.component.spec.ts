import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceBarsPreviewComponent } from './resource-bars-preview.component';

describe('ResourceBarsPreviewComponent', () => {
  let component: ResourceBarsPreviewComponent;
  let fixture: ComponentFixture<ResourceBarsPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceBarsPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceBarsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
