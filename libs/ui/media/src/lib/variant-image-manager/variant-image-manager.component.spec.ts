import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantImageManagerComponent } from './variant-image-manager.component';

describe('VariantImageManagerComponent', () => {
  let component: VariantImageManagerComponent;
  let fixture: ComponentFixture<VariantImageManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantImageManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantImageManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
