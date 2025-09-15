import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopContactComponent } from './droneshop-contact.component';

describe('DroneshopContactComponent', () => {
  let component: DroneshopContactComponent;
  let fixture: ComponentFixture<DroneshopContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
