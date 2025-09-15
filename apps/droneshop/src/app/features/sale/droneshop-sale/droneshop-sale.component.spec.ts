import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopSaleComponent } from './droneshop-sale.component';

describe('DroneshopSaleComponent', () => {
  let component: DroneshopSaleComponent;
  let fixture: ComponentFixture<DroneshopSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopSaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
