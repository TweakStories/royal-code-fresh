import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopCareersComponent } from './droneshop-careers.component';

describe('DroneshopCareersComponent', () => {
  let component: DroneshopCareersComponent;
  let fixture: ComponentFixture<DroneshopCareersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopCareersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopCareersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
