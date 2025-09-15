import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBestsellersComponent } from './dashboard-bestsellers.component';

describe('DashboardBestsellersComponent', () => {
  let component: DashboardBestsellersComponent;
  let fixture: ComponentFixture<DashboardBestsellersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardBestsellersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardBestsellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
