import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsMatrixComponent } from './skills-matrix.component';

describe('SkillsMatrixComponent', () => {
  let component: SkillsMatrixComponent;
  let fixture: ComponentFixture<SkillsMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsMatrixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
