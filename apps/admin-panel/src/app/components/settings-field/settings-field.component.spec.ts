import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsFieldComponent } from './settings-field.component';

describe('SettingsFieldComponent', () => {
  let component: SettingsFieldComponent;
  let fixture: ComponentFixture<SettingsFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
