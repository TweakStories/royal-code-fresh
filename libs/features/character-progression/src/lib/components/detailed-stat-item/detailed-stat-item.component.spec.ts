import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedStatItemComponent } from './detailed-stat-item.component';

describe('DetailedStatItemComponent', () => {
  let component: DetailedStatItemComponent;
  let fixture: ComponentFixture<DetailedStatItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailedStatItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailedStatItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
