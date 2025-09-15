import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopFooterComponent } from './droneshop-footer.component';

describe('DroneshopFooterComponent', () => {
  let component: DroneshopFooterComponent;
  let fixture: ComponentFixture<DroneshopFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
