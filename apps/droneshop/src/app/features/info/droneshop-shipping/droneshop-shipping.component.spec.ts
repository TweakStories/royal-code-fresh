import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopShippingComponent } from './droneshop-shipping.component';

describe('DroneshopShippingComponent', () => {
  let component: DroneshopShippingComponent;
  let fixture: ComponentFixture<DroneshopShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopShippingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
