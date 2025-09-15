import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDeploymentComponent } from './settings-deployment.component';

describe('SettingsDeploymentComponent', () => {
  let component: SettingsDeploymentComponent;
  let fixture: ComponentFixture<SettingsDeploymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsDeploymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsDeploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
