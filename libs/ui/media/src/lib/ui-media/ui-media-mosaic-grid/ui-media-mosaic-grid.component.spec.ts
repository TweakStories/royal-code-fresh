import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMediaMosaicGridComponent } from './ui-media-mosaic-grid.component';

describe('UiMediaMosaicGridComponent', () => {
  let component: UiMediaMosaicGridComponent;
  let fixture: ComponentFixture<UiMediaMosaicGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMediaMosaicGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiMediaMosaicGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
