import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagshipProductPageComponent } from './flagship-product-page.component';

describe('FlagshipProductPageComponent', () => {
  let component: FlagshipProductPageComponent;
  let fixture: ComponentFixture<FlagshipProductPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlagshipProductPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlagshipProductPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
