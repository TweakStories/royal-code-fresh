import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillCategoriesPreviewComponent } from './skill-categories-preview.component';

describe('SkillCategoriesPreviewComponent', () => {
  let component: SkillCategoriesPreviewComponent;
  let fixture: ComponentFixture<SkillCategoriesPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillCategoriesPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillCategoriesPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
