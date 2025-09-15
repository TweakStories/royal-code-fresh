import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterCheckboxComponent } from './filter-checkbox.component';

describe('FilterCheckboxComponent', () => {
  let component: FilterCheckboxComponent;
  let fixture: ComponentFixture<FilterCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
