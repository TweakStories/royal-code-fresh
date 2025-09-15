import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopReturnsComponent } from './droneshop-returns.component';

describe('DroneshopReturnsComponent', () => {
  let component: DroneshopReturnsComponent;
  let fixture: ComponentFixture<DroneshopReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopReturnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
