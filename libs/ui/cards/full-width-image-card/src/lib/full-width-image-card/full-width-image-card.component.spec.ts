import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullWidthImageCardComponent } from './full-width-image-card.component';

describe('FullWidthImageCardComponent', () => {
  let component: FullWidthImageCardComponent;
  let fixture: ComponentFixture<FullWidthImageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullWidthImageCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullWidthImageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
