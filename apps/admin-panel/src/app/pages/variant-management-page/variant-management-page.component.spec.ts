import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantManagementPageComponent } from './variant-management-page.component';

describe('VariantManagementPageComponent', () => {
  let component: VariantManagementPageComponent;
  let fixture: ComponentFixture<VariantManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantManagementPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
