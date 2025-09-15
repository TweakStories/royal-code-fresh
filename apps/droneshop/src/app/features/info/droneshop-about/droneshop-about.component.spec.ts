import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopAboutComponent } from './droneshop-about.component';

describe('DroneshopAboutComponent', () => {
  let component: DroneshopAboutComponent;
  let fixture: ComponentFixture<DroneshopAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopAboutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
