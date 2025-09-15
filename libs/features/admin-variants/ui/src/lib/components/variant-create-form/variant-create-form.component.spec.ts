import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantCreateFormComponent } from './variant-create-form.component';

describe('VariantCreateFormComponent', () => {
  let component: VariantCreateFormComponent;
  let fixture: ComponentFixture<VariantCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantCreateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
