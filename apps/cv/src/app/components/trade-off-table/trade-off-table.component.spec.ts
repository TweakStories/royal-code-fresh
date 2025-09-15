import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeOffTableComponent } from './trade-off-table.component';

describe('TradeOffTableComponent', () => {
  let component: TradeOffTableComponent;
  let fixture: ComponentFixture<TradeOffTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeOffTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeOffTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
