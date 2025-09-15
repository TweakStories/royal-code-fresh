import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiTabPanelComponent } from './ui-tab-panel.component';

describe('UiTabPanelComponent', () => {
  let component: UiTabPanelComponent;
  let fixture: ComponentFixture<UiTabPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTabPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiTabPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
