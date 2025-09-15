import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopCartComponent } from './droneshop-cart.component';

describe('DroneshopCartComponent', () => {
  let component: DroneshopCartComponent;
  let fixture: ComponentFixture<DroneshopCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopCartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
