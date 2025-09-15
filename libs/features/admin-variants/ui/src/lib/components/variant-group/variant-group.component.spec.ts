import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantGroupComponent } from './variant-group.component';

describe('VariantGroupComponent', () => {
  let component: VariantGroupComponent;
  let fixture: ComponentFixture<VariantGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
