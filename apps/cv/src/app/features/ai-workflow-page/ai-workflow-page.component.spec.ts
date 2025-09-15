import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiWorkflowPageComponent } from './ai-workflow-page.component';

describe('AiWorkflowPageComponent', () => {
  let component: AiWorkflowPageComponent;
  let fixture: ComponentFixture<AiWorkflowPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiWorkflowPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiWorkflowPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
