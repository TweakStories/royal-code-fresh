import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiyKitsPageComponent } from './diy-kits-page.component';

describe('DiyKitsPageComponent', () => {
  let component: DiyKitsPageComponent;
  let fixture: ComponentFixture<DiyKitsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiyKitsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiyKitsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
