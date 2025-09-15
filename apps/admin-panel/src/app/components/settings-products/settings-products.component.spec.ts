import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsProductsComponent } from './settings-products.component';

describe('SettingsProductsComponent', () => {
  let component: SettingsProductsComponent;
  let fixture: ComponentFixture<SettingsProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
