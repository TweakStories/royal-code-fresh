import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiyKitCardComponent } from './diy-kit-card.component';

describe('DiyKitCardComponent', () => {
  let component: DiyKitCardComponent;
  let fixture: ComponentFixture<DiyKitCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiyKitCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiyKitCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
