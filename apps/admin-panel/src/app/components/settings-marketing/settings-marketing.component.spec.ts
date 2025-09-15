import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsMarketingComponent } from './settings-marketing.component';

describe('SettingsMarketingComponent', () => {
  let component: SettingsMarketingComponent;
  let fixture: ComponentFixture<SettingsMarketingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsMarketingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsMarketingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
