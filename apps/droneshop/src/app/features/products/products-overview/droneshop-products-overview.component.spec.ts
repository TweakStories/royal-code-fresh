import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopProductsOverviewComponent } from './droneshop-products-overview.component';

describe('DroneshopProductsOverviewComponent', () => {
  let component: DroneshopProductsOverviewComponent;
  let fixture: ComponentFixture<DroneshopProductsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopProductsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopProductsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
