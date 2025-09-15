import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillCategoryCardComponent } from './skill-category-card.component';

describe('SkillCategoryCardComponent', () => {
  let component: SkillCategoryCardComponent;
  let fixture: ComponentFixture<SkillCategoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillCategoryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillCategoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
