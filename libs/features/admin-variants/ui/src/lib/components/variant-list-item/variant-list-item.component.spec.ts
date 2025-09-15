import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantListItemComponent } from './variant-list-item.component';

describe('VariantListItemComponent', () => {
  let component: VariantListItemComponent;
  let fixture: ComponentFixture<VariantListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
