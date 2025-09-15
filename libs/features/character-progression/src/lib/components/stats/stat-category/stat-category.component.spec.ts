import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCategoryComponent } from './stat-category.component';

describe('StatCategoryComponent', () => {
  let component: StatCategoryComponent;
  let fixture: ComponentFixture<StatCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
