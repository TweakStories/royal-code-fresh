import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeskillCardComponent } from './lifeskill-card.component';

describe('LifeskillCardComponent', () => {
  let component: LifeskillCardComponent;
  let fixture: ComponentFixture<LifeskillCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifeskillCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeskillCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
