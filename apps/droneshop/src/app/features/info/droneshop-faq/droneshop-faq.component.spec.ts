import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopFaqComponent } from './droneshop-faq.component';

describe('DroneshopFaqComponent', () => {
  let component: DroneshopFaqComponent;
  let fixture: ComponentFixture<DroneshopFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopFaqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
