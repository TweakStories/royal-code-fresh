import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComplianceComponent } from './settings-compliance.component';

describe('SettingsComplianceComponent', () => {
  let component: SettingsComplianceComponent;
  let fixture: ComponentFixture<SettingsComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComplianceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
