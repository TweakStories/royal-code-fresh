import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsGovernanceComponent } from './settings-governance.component';

describe('SettingsGovernanceComponent', () => {
  let component: SettingsGovernanceComponent;
  let fixture: ComponentFixture<SettingsGovernanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsGovernanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsGovernanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
