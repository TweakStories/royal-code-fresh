import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillCloudComponent } from './skill-cloud.component';

describe('SkillCloudComponent', () => {
  let component: SkillCloudComponent;
  let fixture: ComponentFixture<SkillCloudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillCloudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
