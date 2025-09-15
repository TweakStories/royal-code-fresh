import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtfProductCardComponent } from './rtf-product-card.component';

describe('RtfProductCardComponent', () => {
  let component: RtfProductCardComponent;
  let fixture: ComponentFixture<RtfProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RtfProductCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RtfProductCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
