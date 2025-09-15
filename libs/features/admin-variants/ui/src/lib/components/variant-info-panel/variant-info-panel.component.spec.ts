import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantInfoPanelComponent } from './variant-info-panel.component';

describe('VariantInfoPanelComponent', () => {
  let component: VariantInfoPanelComponent;
  let fixture: ComponentFixture<VariantInfoPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantInfoPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantInfoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
