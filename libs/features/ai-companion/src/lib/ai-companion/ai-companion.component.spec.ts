import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiCompanionComponent } from './ai-companion.component';

describe('AiCompanionComponent', () => {
  let component: AiCompanionComponent;
  let fixture: ComponentFixture<AiCompanionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiCompanionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiCompanionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
