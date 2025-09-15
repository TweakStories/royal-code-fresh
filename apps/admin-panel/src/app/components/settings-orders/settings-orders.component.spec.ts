import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsOrdersComponent } from './settings-orders.component';

describe('SettingsOrdersComponent', () => {
  let component: SettingsOrdersComponent;
  let fixture: ComponentFixture<SettingsOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
