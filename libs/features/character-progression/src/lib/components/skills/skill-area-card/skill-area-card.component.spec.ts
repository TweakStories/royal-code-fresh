import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillAreaCardComponent } from './skill-area-card.component';

describe('SkillAreaCardComponent', () => {
  let component: SkillAreaCardComponent;
  let fixture: ComponentFixture<SkillAreaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillAreaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillAreaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
